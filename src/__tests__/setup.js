// Global test setup — runs before every test file.
// Provides browser globals not available in the Node test environment.
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _store: {},
    getItem(key) { return this._store[key] ?? null },
    setItem(key, value) { this._store[key] = String(value) },
    removeItem(key) { delete this._store[key] },
    clear() { this._store = {} },
  }
}
