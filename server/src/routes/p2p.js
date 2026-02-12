const express = require('express');
const router = express.Router();
const p2pService = require('../services/p2pService');

router.get('/room/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = p2pService.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      roomId,
      metadata: room.metadata,
      hasReceiver: !!room.receiver,
      createdAt: room.createdAt,
      startedAt: room.startedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const rooms = Array.from(p2pService.rooms.values());
    
    res.json({
      totalRooms: rooms.length,
      activeTransfers: rooms.filter(r => r.receiver).length,
      waitingRooms: rooms.filter(r => !r.receiver).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;