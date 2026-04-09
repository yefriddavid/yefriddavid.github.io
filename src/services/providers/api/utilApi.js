/**
 * utilApi — Axios instance for Google Apps Script (GAS) requests.
 *
 * Interceptors:
 *  - Request: injects a fresh Firebase ID token into every FormData payload
 *  - Response: on 401, forces a token refresh and retries the request once
 */

import axios from 'axios'
import { auth } from 'src/services/providers/firebase/settings'

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

const instance = axios.create({ baseURL: GAS_URL })

// ── Request interceptor — inject fresh token ───────────────────────────────────
instance.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      // GAS receives FormData — append token so GAS can optionally verify it
      if (config.data instanceof FormData) {
        config.data.set('firebaseToken', token)
      }
    } catch {
      // If getIdToken fails, proceed without token (GAS will handle it)
    }
  }
  return config
})

// ── Response interceptor — refresh + retry on 401 ─────────────────────────────
let isRefreshing = false
let pendingRetries = []

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Only retry once, only on 401
    if (err.response?.status === 401 && !original._retried) {
      original._retried = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          // Force Firebase to issue a new ID token using the refresh token
          await auth.currentUser?.getIdToken(true)
          pendingRetries.forEach((resolve) => resolve())
        } catch {
          pendingRetries.forEach((_, i, arr) => arr[i](Promise.reject(err)))
        } finally {
          pendingRetries = []
          isRefreshing = false
        }
      }

      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        pendingRetries.push(() => {
          instance.request(original).then(resolve).catch(reject)
        })
      })
    }

    return Promise.reject(err)
  },
)

export { instance as axios }
