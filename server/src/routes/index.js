const express = require('express');
const router = express.Router();

const uploadRoutes = require('./upload');
const downloadRoutes = require('./download');
const infoRoutes = require('./info');
const rawRoutes = require('./raw');
const p2pRoutes = require('./p2p');

router.use('/upload', uploadRoutes);
router.use('/download', downloadRoutes);
router.use('/info', infoRoutes);
router.use('/raw', rawRoutes);
router.use('/p2p', p2pRoutes);

module.exports = router;