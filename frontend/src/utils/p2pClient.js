import { generateKey, exportKey, importKey, encryptChunk, decryptChunk, arrayBufferToBase64, base64ToArrayBuffer } from './encryption';

const CHUNK_SIZE = 64 * 1024;

export class P2PClient {
  constructor() {
    this.ws = null;
    this.roomId = null;
    this.userId = null;
    this.encryptionKey = null;
    this.role = null;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
    this.onPeerJoined = null;
    this.onPeerDisconnected = null;
    
    this.transferData = {
      file: null,
      chunks: [],
      currentChunk: 0,
      totalChunks: 0,
      bytesTransferred: 0,
      startTime: null
    };
  }

  async connect(wsUrl) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('Disconnected from P2P server');
      };

      this.ws.onerror = (error) => {
        if (this.onError) this.onError(error);
        reject(error);
      };

      const timeout = setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          reject(new Error('Connection timeout. Make sure the server is running.'));
        }
      }, 5000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  async createRoom(file, encrypted = true) {
    return new Promise(async (resolve, reject) => {
      this.role = 'sender';
      this.transferData.file = file;

      if (encrypted) {
        this.encryptionKey = await generateKey();
      }

      const originalOnMessage = this.ws.onmessage;
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'room-created') {
          this.roomId = message.data.roomId;
          this.userId = message.data.userId;
          this.ws.onmessage = originalOnMessage;
          resolve();
        }
        this.handleMessage(message);
      };

      this.ws.send(JSON.stringify({
        type: 'create-room',
        data: {
          filename: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          encrypted: encrypted
        }
      }));

      setTimeout(() => {
        reject(new Error('Failed to create room'));
      }, 5000);
    });
  }

  async joinRoom(roomId) {
    this.role = 'receiver';
    this.roomId = roomId;

    this.ws.send(JSON.stringify({
      type: 'join-room',
      data: { roomId }
    }));
  }

  async startSending() {
    if (!this.transferData.file) {
      throw new Error('No file to send');
    }

    const file = this.transferData.file;
    this.transferData.totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    this.transferData.currentChunk = 0;
    this.transferData.bytesTransferred = 0;
    this.transferData.startTime = Date.now();

    await this.sendNextChunk();
  }

  async sendNextChunk() {
    if (this.transferData.currentChunk >= this.transferData.totalChunks) {
      this.ws.send(JSON.stringify({
        type: 'transfer-complete',
        data: {
          bytesTransferred: this.transferData.bytesTransferred
        }
      }));
      return;
    }

    const start = this.transferData.currentChunk * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, this.transferData.file.size);
    const chunk = this.transferData.file.slice(start, end);
    
    const arrayBuffer = await chunk.arrayBuffer();
    let data = new Uint8Array(arrayBuffer);

    if (this.encryptionKey) {
      data = await encryptChunk(this.encryptionKey, data);
    }

    const base64Data = arrayBufferToBase64(data);

    this.ws.send(JSON.stringify({
      type: 'transfer-chunk',
      data: {
        chunk: base64Data,
        index: this.transferData.currentChunk,
        total: this.transferData.totalChunks,
        bytesTransferred: end
      }
    }));

    this.transferData.currentChunk++;
    this.transferData.bytesTransferred = end;

    if (this.onProgress) {
      this.onProgress({
        bytesTransferred: end,
        totalBytes: this.transferData.file.size,
        percentage: (end / this.transferData.file.size) * 100,
        speed: this.calculateSpeed()
      });
    }

    setTimeout(() => this.sendNextChunk(), 10);
  }

  calculateSpeed() {
    if (!this.transferData.startTime) return 0;
    const elapsed = (Date.now() - this.transferData.startTime) / 1000;
    return this.transferData.bytesTransferred / elapsed;
  }

  async handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'connected':
        break;

      case 'room-created':
        this.roomId = data.roomId;
        this.userId = data.userId;
        break;

      case 'room-joined':
        this.roomId = data.roomId;
        this.userId = data.userId;
        this.transferData.file = {
          name: data.metadata.filename,
          size: data.metadata.size,
          type: data.metadata.type
        };
        if (data.metadata.encrypted) {
        }
        break;

      case 'receiver-joined':
        if (this.onPeerJoined) this.onPeerJoined();
        await this.startSending();
        break;

      case 'transfer-chunk':
        await this.handleChunk(data);
        break;

      case 'transfer-complete':
        if (this.onComplete) {
          this.onComplete(data);
        }
        break;

      case 'peer-disconnected':
        if (this.onPeerDisconnected) this.onPeerDisconnected();
        break;

      case 'room-expired':
        if (this.onError) this.onError(new Error('Room expired'));
        break;

      case 'error':
        if (this.onError) this.onError(new Error(data.message));
        break;
    }
  }
  
  async handleChunk(data) {
    const encryptedData = base64ToArrayBuffer(data.chunk);
    let chunkData = new Uint8Array(encryptedData);

    if (this.encryptionKey) {
      chunkData = await decryptChunk(this.encryptionKey, chunkData);
    }

    this.transferData.chunks.push(chunkData);
    this.transferData.bytesTransferred = data.bytesTransferred;

    if (!this.transferData.startTime) {
      this.transferData.startTime = Date.now();
    }

    if (this.onProgress) {
      this.onProgress({
        bytesTransferred: data.bytesTransferred,
        totalBytes: this.transferData.file.size,
        percentage: (data.bytesTransferred / this.transferData.file.size) * 100,
        speed: this.calculateSpeed()
      });
    }
  }

  getReceivedFile() {
    return new Blob(this.transferData.chunks, { type: this.transferData.file.type });
  }

  async setEncryptionKey(keyString) {
    this.encryptionKey = await importKey(keyString);
  }

  async getEncryptionKey() {
    if (!this.encryptionKey) return null;
    return await exportKey(this.encryptionKey);
  }

  cancel() {
    if (this.ws) {
      this.ws.send(JSON.stringify({ type: 'cancel-transfer' }));
      this.ws.close();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}