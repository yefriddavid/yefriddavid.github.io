/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebSocketService } from '../services/websocketService'

// ─── Mock WebSocket ───────────────────────────────────────────────────────────

class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = MockWebSocket.CONNECTING
    this.onopen = null
    this.onmessage = null
    this.onclose = null
    this.onerror = null
    MockWebSocket.instances.push(this)
  }

  close(code = 1000) {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code })
  }

  send() {}
}

MockWebSocket.CONNECTING = 0
MockWebSocket.OPEN = 1
MockWebSocket.CLOSING = 2
MockWebSocket.CLOSED = 3
MockWebSocket.instances = []

function lastSocket() {
  return MockWebSocket.instances.at(-1)
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  MockWebSocket.instances = []
  globalThis.WebSocket = MockWebSocket
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('constructor', () => {
  it('initializes with correct defaults', () => {
    const ws = new WebSocketService('wss://example.com')

    expect(ws.url).toBe('wss://example.com')
    expect(ws.socket).toBeNull()
    expect(ws.reconnectAttempt).toBe(0)
    expect(ws.listeners).toBeInstanceOf(Set)
    expect(ws.listeners.size).toBe(0)
    expect(ws.reconnectTimer).toBeNull()
  })

  it('registers window focus listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    new WebSocketService('wss://example.com')

    expect(addSpy).toHaveBeenCalledWith('focus', expect.any(Function))
  })

  it('connects on window focus when socket is null', () => {
    const ws = new WebSocketService('wss://example.com')
    const connectSpy = vi.spyOn(ws, 'connect')

    window.dispatchEvent(new Event('focus'))

    expect(connectSpy).toHaveBeenCalled()
    expect(ws.reconnectAttempt).toBe(0)
  })

  it('reconnects on window focus when socket is CLOSED', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.socket = { readyState: MockWebSocket.CLOSED }
    const connectSpy = vi.spyOn(ws, 'connect')

    window.dispatchEvent(new Event('focus'))

    expect(connectSpy).toHaveBeenCalled()
    expect(ws.reconnectAttempt).toBe(0)
  })

  it('does not reconnect on focus when socket is OPEN', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.socket = { readyState: MockWebSocket.OPEN }
    const connectSpy = vi.spyOn(ws, 'connect')

    window.dispatchEvent(new Event('focus'))

    expect(connectSpy).not.toHaveBeenCalled()
  })
})

// ─── connect() ────────────────────────────────────────────────────────────────

describe('connect()', () => {
  it('creates a new WebSocket and assigns handlers', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.connect()

    const sock = lastSocket()
    expect(sock).toBeDefined()
    expect(sock.url).toBe('wss://example.com')
    expect(sock.onopen).toBeTypeOf('function')
    expect(sock.onmessage).toBeTypeOf('function')
    expect(sock.onclose).toBeTypeOf('function')
    expect(sock.onerror).toBeTypeOf('function')
  })

  it('skips creating a new socket when current one is OPEN', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.connect()
    const firstSocket = lastSocket()
    firstSocket.readyState = MockWebSocket.OPEN

    ws.connect()

    expect(MockWebSocket.instances).toHaveLength(1)
  })

  it('skips creating a new socket when current one is CONNECTING', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.connect()
    // readyState starts as CONNECTING by default

    ws.connect()

    expect(MockWebSocket.instances).toHaveLength(1)
  })

  it('clears pending reconnect timer before connecting', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.reconnectTimer = setTimeout(() => {}, 9999)

    ws.connect()

    expect(ws.reconnectTimer).toBeNull()
  })

  it('resets reconnectAttempt to 0 on successful open', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.reconnectAttempt = 3
    ws.connect()

    lastSocket().onopen()

    expect(ws.reconnectAttempt).toBe(0)
  })

  it('sets socket to null and schedules reconnect on close', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.connect()
    const scheduleSpy = vi.spyOn(ws, 'scheduleReconnect')

    lastSocket().onclose({ code: 1006 })

    expect(ws.socket).toBeNull()
    expect(scheduleSpy).toHaveBeenCalled()
  })

  it('schedules reconnect when WebSocket constructor throws', () => {
    globalThis.WebSocket = vi.fn(() => {
      throw new Error('Connection refused')
    })
    const ws = new WebSocketService('wss://example.com')
    const scheduleSpy = vi.spyOn(ws, 'scheduleReconnect')

    ws.connect()

    expect(scheduleSpy).toHaveBeenCalled()
  })
})

// ─── onmessage ────────────────────────────────────────────────────────────────

describe('onmessage handler', () => {
  it('parses JSON and calls all listeners', () => {
    const ws = new WebSocketService('wss://example.com')
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    ws.subscribe(cb1)
    ws.subscribe(cb2)

    const payload = { type: 'location', lat: 4.6, lng: -74.1 }
    lastSocket().onmessage({ data: JSON.stringify(payload) })

    expect(cb1).toHaveBeenCalledWith(payload)
    expect(cb2).toHaveBeenCalledWith(payload)
  })

  it('does not throw on malformed JSON', () => {
    const ws = new WebSocketService('wss://example.com')
    const cb = vi.fn()
    ws.subscribe(cb)

    expect(() => lastSocket().onmessage({ data: 'not json' })).not.toThrow()
    expect(cb).not.toHaveBeenCalled()
  })
})

// ─── scheduleReconnect() ──────────────────────────────────────────────────────

describe('scheduleReconnect()', () => {
  it('increments reconnectAttempt and calls connect after delay', () => {
    const ws = new WebSocketService('wss://example.com')
    const connectSpy = vi.spyOn(ws, 'connect')

    ws.scheduleReconnect()
    vi.runAllTimers()

    expect(ws.reconnectAttempt).toBe(1)
    expect(connectSpy).toHaveBeenCalled()
  })

  it('does nothing if a timer is already scheduled', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.scheduleReconnect()
    const timerAfterFirst = ws.reconnectTimer

    ws.scheduleReconnect()

    expect(ws.reconnectTimer).toBe(timerAfterFirst)
  })

  it('clears reconnectTimer before calling connect', () => {
    const ws = new WebSocketService('wss://example.com')
    vi.spyOn(ws, 'connect').mockImplementation(() => {})

    ws.scheduleReconnect()
    vi.runAllTimers()

    expect(ws.reconnectTimer).toBeNull()
  })

  it('caps delay at 30000ms regardless of attempt count', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.reconnectAttempt = 99
    vi.spyOn(ws, 'connect').mockImplementation(() => {})

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    ws.scheduleReconnect()

    const delay = setTimeoutSpy.mock.calls[0][1]
    expect(delay).toBeLessThanOrEqual(30000)
  })

  it('uses exponential backoff on lower attempt counts', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.reconnectAttempt = 0
    vi.spyOn(ws, 'connect').mockImplementation(() => {})

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    ws.scheduleReconnect()

    const delay = setTimeoutSpy.mock.calls[0][1]
    // attempt 0 → base = 1000ms + jitter [0,1000) → range [1000, 2000)
    expect(delay).toBeGreaterThanOrEqual(1000)
    expect(delay).toBeLessThan(2000)
  })
})

// ─── subscribe() ──────────────────────────────────────────────────────────────

describe('subscribe()', () => {
  it('adds callback to listeners and triggers connect', () => {
    const ws = new WebSocketService('wss://example.com')
    const connectSpy = vi.spyOn(ws, 'connect')
    const cb = vi.fn()

    ws.subscribe(cb)

    expect(ws.listeners.has(cb)).toBe(true)
    expect(connectSpy).toHaveBeenCalled()
  })

  it('returns an unsubscribe function that removes the callback', () => {
    const ws = new WebSocketService('wss://example.com')
    const cb = vi.fn()

    const unsubscribe = ws.subscribe(cb)
    unsubscribe()

    expect(ws.listeners.has(cb)).toBe(false)
  })

  it('multiple subscribers each receive messages independently', () => {
    const ws = new WebSocketService('wss://example.com')
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    ws.subscribe(cb1)
    ws.subscribe(cb2)

    lastSocket().onmessage({ data: JSON.stringify({ x: 1 }) })

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('unsubscribed callback no longer receives messages', () => {
    const ws = new WebSocketService('wss://example.com')
    const cb = vi.fn()
    const unsubscribe = ws.subscribe(cb)
    unsubscribe()

    lastSocket().onmessage({ data: JSON.stringify({ x: 1 }) })

    expect(cb).not.toHaveBeenCalled()
  })
})

// ─── disconnect() ─────────────────────────────────────────────────────────────

describe('disconnect()', () => {
  it('clears reconnect timer and closes socket', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.connect()
    const sock = lastSocket()
    const closeSpy = vi.spyOn(sock, 'close')
    // Prevent onclose from re-scheduling a reconnect so we can test disconnect in isolation
    vi.spyOn(ws, 'scheduleReconnect').mockImplementation(() => {})
    ws.socket = sock

    ws.disconnect()

    expect(closeSpy).toHaveBeenCalled()
    expect(ws.socket).toBeNull()
  })

  it('cancels a pending reconnect timer', () => {
    const ws = new WebSocketService('wss://example.com')
    ws.scheduleReconnect()
    expect(ws.reconnectTimer).not.toBeNull()

    ws.disconnect()

    expect(ws.reconnectTimer).toBeNull()
  })

  it('does not throw when called with no active socket', () => {
    const ws = new WebSocketService('wss://example.com')
    expect(() => ws.disconnect()).not.toThrow()
  })

  it('cancels pending reconnect timer before closing', () => {
    const ws = new WebSocketService('wss://example.com')
    // Simulate a pending reconnect timer already set
    const existingTimer = setTimeout(() => {}, 9999)
    ws.reconnectTimer = existingTimer
    vi.spyOn(ws, 'scheduleReconnect').mockImplementation(() => {})

    ws.disconnect()

    // The pre-existing timer should have been cancelled (timer is cleared)
    expect(ws.reconnectTimer).toBeNull()
  })
})
