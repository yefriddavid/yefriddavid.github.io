export class WebSocketService {
  constructor(url) {
    this.url = url
    this.socket = null
    this.reconnectAttempt = 0
    this.listeners = new Set()
    this.reconnectTimer = null

    // Handle window focus to ensure connection
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
          this.reconnectAttempt = 0
          this.connect()
        }
      })
    }
  }

  connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    const attempt = this.reconnectAttempt + 1
    console.log(`WebSocket: Connection attempt ${attempt} to ${this.url}...`)

    try {
      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        console.log('WebSocket: Connected successfully')
        this.reconnectAttempt = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.listeners.forEach((callback) => callback(data))
        } catch (error) {
          console.error('WebSocket: Parse error', error)
        }
      }

      this.socket.onclose = (e) => {
        console.log(`WebSocket: Closed (${e.code})`)
        this.socket = null
        this.scheduleReconnect()
      }

      this.socket.onerror = (err) => {
        console.error('WebSocket: Error', err)
        // onclose will handle reconnection
      }
    } catch (error) {
      console.error('WebSocket: Connection error', error)
      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt) + Math.random() * 1000, 30000)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt += 1
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  get listenerCount() {
    return this.listeners.size
  }

  subscribe(callback) {
    this.listeners.add(callback)
    // Auto-connect on first subscription
    this.connect()
    return () => {
      this.listeners.delete(callback)
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const taxiWebSocket = new WebSocketService('wss://3.92.69.78:1979/echo_test')
