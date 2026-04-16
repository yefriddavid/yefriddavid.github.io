// Global test setup — runs before every test file.
// Provides browser globals not available in the Node test environment.

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _store: {},
    getItem(key) {
      return this._store[key] ?? null
    },
    setItem(key, value) {
      this._store[key] = String(value)
    },
    removeItem(key) {
      delete this._store[key]
    },
    clear() {
      this._store = {}
    },
  }
}

// Firebase Messaging requires navigator and Notification at module load time.
// These stubs prevent ReferenceError when firebase/messaging is imported in Node.
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {
    userAgent: 'Mozilla/5.0 (node-test)',
    serviceWorker: undefined,
    permissions: undefined,
  }
}

if (typeof globalThis.Notification === 'undefined') {
  globalThis.Notification = {
    permission: 'denied',
    requestPermission: () => Promise.resolve('denied'),
  }
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis
}
