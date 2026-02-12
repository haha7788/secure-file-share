const WebSocket = require('ws');
const p2pService = require('./p2pService');

class WebSocketService {
  constructor() {
    this.wss = null;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server, 
      path: '/p2p',
      verifyClient: () => {
        return true;
      }
    });

    this.wss.on('connection', (ws, req) => {
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (err) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            data: { message: 'Invalid message format' } 
          }));
        }
      });

      ws.on('close', () => {
        p2pService.removeClient(ws);
      });

      ws.on('error', (err) => {
        p2pService.removeClient(ws);
      });

      ws.send(JSON.stringify({ 
        type: 'connected', 
        data: { message: 'Connected to P2P server' } 
      }));
    });

    setInterval(() => {
      p2pService.cleanupOldRooms();
    }, 60 * 1000);
  }

  handleMessage(ws, message) {
    const { type, data } = message;

    switch (type) {
      case 'create-room':
        this.handleCreateRoom(ws, data);
        break;

      case 'join-room':
        this.handleJoinRoom(ws, data);
        break;

      case 'transfer-chunk':
        this.handleTransferChunk(ws, data);
        break;

      case 'transfer-complete':
        this.handleTransferComplete(ws, data);
        break;

      case 'cancel-transfer':
        this.handleCancelTransfer(ws);
        break;

      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          data: { message: 'Unknown message type' } 
        }));
    }
  }

  handleCreateRoom(ws, data) {
    try {
      const { roomId, userId } = p2pService.createRoom(ws, data);

      ws.send(JSON.stringify({
        type: 'room-created',
        data: { roomId, userId, metadata: data }
      }));

    } catch (err) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: err.message }
      }));
    }
  }

  handleJoinRoom(ws, data) {
    try {
      const { roomId } = data;
      const { userId, metadata } = p2pService.joinRoom(roomId, ws);
      const room = p2pService.getRoom(roomId);

      if (room.sender && room.sender.readyState === WebSocket.OPEN) {
        room.sender.send(JSON.stringify({
          type: 'receiver-joined',
          data: { userId }
        }));
      }

      ws.send(JSON.stringify({
        type: 'room-joined',
        data: { roomId, userId, metadata }
      }));

    } catch (err) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: err.message }
      }));
    }
  }

  handleTransferChunk(ws, data) {
    const client = p2pService.getClient(ws);
    
    if (!client) {
      return ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Not in a room' }
      }));
    }

    const room = p2pService.getRoom(client.roomId);
    if (!room) {
      return ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Room not found' }
      }));
    }

    if (data.bytesTransferred) {
      p2pService.updateStats(client.roomId, data.bytesTransferred);
    }

    const targetWs = client.role === 'sender' ? room.receiver : room.sender;
    
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      targetWs.send(JSON.stringify({
        type: 'transfer-chunk',
        data: data
      }));
    }
  }

  handleTransferComplete(ws, data) {
    const client = p2pService.getClient(ws);
    
    if (!client) {
      return;
    }

    const stats = p2pService.completeTransfer(client.roomId);
    const room = p2pService.getRoom(client.roomId);

    if (room) {
      const message = JSON.stringify({
        type: 'transfer-complete',
        data: stats
      });

      if (room.sender && room.sender.readyState === WebSocket.OPEN) {
        room.sender.send(message);
      }

      if (room.receiver && room.receiver.readyState === WebSocket.OPEN) {
        room.receiver.send(message);
      }
    }
  }

  handleCancelTransfer(ws) {
    p2pService.removeClient(ws);
  }
}

module.exports = new WebSocketService();