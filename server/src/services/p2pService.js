const { v4: uuidv4 } = require('uuid');

class P2PService {
  constructor() {
    this.rooms = new Map();
    this.clients = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  createRoom(senderWs, metadata) {
    const roomId = this.generateRoomCode();
    const userId = uuidv4();

    this.rooms.set(roomId, {
      sender: senderWs,
      receiver: null,
      metadata: {
        filename: metadata.filename,
        size: metadata.size,
        type: metadata.type || 'file',
        encrypted: metadata.encrypted || false
      },
      createdAt: Date.now(),
      startedAt: null,
      stats: {
        bytesTransferred: 0,
        startTime: null,
        endTime: null
      }
    });

    this.clients.set(senderWs, { roomId, role: 'sender', userId });

    return { roomId, userId };
  }

  joinRoom(roomId, receiverWs) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.receiver) {
      throw new Error('Room is full');
    }

    const userId = uuidv4();
    room.receiver = receiverWs;
    room.startedAt = Date.now();
    
    this.clients.set(receiverWs, { roomId, role: 'receiver', userId });

    return { userId, metadata: room.metadata };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getClient(ws) {
    return this.clients.get(ws);
  }

  updateStats(roomId, bytesTransferred) {
    const room = this.rooms.get(roomId);
    if (room) {
      if (!room.stats.startTime) {
        room.stats.startTime = Date.now();
      }
      room.stats.bytesTransferred = bytesTransferred;
    }
  }

  completeTransfer(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.stats.endTime = Date.now();
      const duration = (room.stats.endTime - room.stats.startTime) / 1000;
      const avgSpeed = room.stats.bytesTransferred / duration;
      
      return {
        bytesTransferred: room.stats.bytesTransferred,
        duration,
        avgSpeed,
        filename: room.metadata.filename,
        size: room.metadata.size
      };
    }
    return null;
  }

  removeClient(ws) {
    const client = this.clients.get(ws);
    
    if (client) {
      const room = this.rooms.get(client.roomId);
      
      if (room) {
        const otherWs = client.role === 'sender' ? room.receiver : room.sender;
        
        if (otherWs && otherWs.readyState === 1) {
          otherWs.send(JSON.stringify({
            type: 'peer-disconnected',
            data: { role: client.role }
          }));
        }

        this.rooms.delete(client.roomId);
      }

      this.clients.delete(ws);
    }
  }

  cleanupOldRooms() {
    const now = Date.now();
    const timeout = 10 * 60 * 1000;

    for (const [roomId, room] of this.rooms.entries()) {
      if (!room.receiver && (now - room.createdAt) > timeout) {
        if (room.sender && room.sender.readyState === 1) {
          room.sender.send(JSON.stringify({
            type: 'room-expired',
            data: { roomId }
          }));
        }
        this.rooms.delete(roomId);
      }
    }
  }
}

module.exports = new P2PService();