export class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectAttempt = 0;
    this.listeners = new Set();
    this.reconnectTimer = null;
  }

  connect() {
    if (this.socket || this.reconnectTimer) return;

    console.log(`WebSocket: Connecting to ${this.url}...`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket: Connected');
      this.reconnectAttempt = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((callback) => callback(data));
      } catch (error) {
        console.error('WebSocket: Parse error', error);
      }
    };

    this.socket.onclose = (e) => {
      console.log(`WebSocket: Closed (${e.code})`);
      this.socket = null;
      this.scheduleReconnect();
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket: Error', err);
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt) + Math.random() * 1000, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt += 1;
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) this.socket.close();
    this.socket = null;
  }
}

export const taxiWebSocket = new WebSocketService('wss://3.92.69.78:1979/echo_test');
