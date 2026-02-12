const express = require('express');
const router = express.Router();
const { downloadLimiter, logError, validateExpiry, passwordAuth } = require('../middleware');
const { deleteFile, getAbsolutePath, saveMetadata } = require('../services');
const { createContentDisposition } = require('../utils/helpers');
const fs = require('fs').promises;

const activeDownloads = new Map();

router.post('/:id', downloadLimiter, validateExpiry, passwordAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { metadata } = req;

    if (activeDownloads.has(id)) {
      return res.status(429).json({ error: 'Download already in progress' });
    }

    activeDownloads.set(id, true);

    try {
      if (metadata.maxDownloads > 0 && metadata.downloads >= metadata.maxDownloads) {
        await deleteFile(id);
        return res.status(410).json({ error: 'Download limit reached' });
      }

      metadata.downloads += 1;
      const shouldDelete = metadata.maxDownloads > 0 && metadata.downloads >= metadata.maxDownloads;
      await saveMetadata(id, metadata);

      const absolutePath = getAbsolutePath(metadata.filePath);

      if (metadata.isText) {
        try {
          const textContent = await fs.readFile(absolutePath, 'utf-8');
          activeDownloads.delete(id);
          
          if (shouldDelete) {
            await deleteFile(id);
          }
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.send(textContent);
        } catch (err) {
          activeDownloads.delete(id);
          logError('Text read error', err, { fileId: id });
          return res.status(500).json({ error: 'Failed to read text' });
        }
      }

      const contentDisposition = createContentDisposition(metadata.filename);
      res.setHeader('Content-Disposition', contentDisposition);

      res.sendFile(absolutePath, async (err) => {
        activeDownloads.delete(id);
        if (err) {
          logError('Download stream error', err, { fileId: id });
        }
        if (shouldDelete) {
          await deleteFile(id);
        }
      });
    } catch (innerErr) {
      activeDownloads.delete(id);
      throw innerErr;
    }
  } catch (err) {
    activeDownloads.delete(id);
    logError('Download failed', err, { fileId: req.params.id });
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;