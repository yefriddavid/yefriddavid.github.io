/**
 * firebaseClient — middleware for all Firestore operations.
 *
 * Centralizes:
 *  - Token refresh before each call (via Firebase Auth)
 *  - Error normalization (Firebase codes → human messages)
 *  - Auth error handling (permission-denied → logout)
 *  - Automatic retry with exponential backoff for transient errors
 *
 * Usage:
 *   import { firestoreCall } from 'src/services/firebase/firebaseClient'
 *
 *   // Before: const snap = await getDocs(q)
 *   // After:  const snap = await firestoreCall(() => getDocs(q))
 */

import { signOut } from 'firebase/auth'
import { auth } from './settings'

// ── Error normalization ────────────────────────────────────────────────────────

const ERROR_MESSAGES = {
  'permission-denied': 'Sin permisos para esta operación',
  unauthenticated: 'Sesión expirada — inicie sesión nuevamente',
  'not-found': 'Registro no encontrado',
  unavailable: 'Firebase no disponible, intente más tarde',
  'resource-exhausted': 'Demasiadas solicitudes, espere un momento',
  cancelled: 'Operación cancelada',
  'data-loss': 'Error de integridad de datos',
  'deadline-exceeded': 'Tiempo de espera agotado',
}

function normalizeError(err) {
  const userMessage = ERROR_MESSAGES[err.code] ?? err.message ?? 'Error desconocido'
  const normalized = new Error(userMessage)
  normalized.code = err.code
  normalized.original = err
  return normalized
}

// ── Auth error handler ─────────────────────────────────────────────────────────

async function handleAuthFailure() {
  try {
    await signOut(auth)
  } catch {
    // ignore signOut errors
  }
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('sessionId')
  localStorage.removeItem('landingPage')
  // Redirect to login — works with HashRouter
  window.location.hash = '#/login'
}

// ── Transient errors (worth retrying) ─────────────────────────────────────────

const RETRYABLE_CODES = new Set(['unavailable', 'deadline-exceeded', 'resource-exhausted'])

function isRetryable(err) {
  return RETRYABLE_CODES.has(err.code)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Main wrapper ───────────────────────────────────────────────────────────────

/**
 * @param {() => Promise<any>} operation   Firestore operation to execute
 * @param {{ retries?: number }} options
 * @returns {Promise<any>}
 */
export async function firestoreCall(operation, { retries = 1 } = {}) {
  let lastErr

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Refresh Firebase Auth token before each attempt.
      // On retry (attempt > 0) force a network refresh.
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(attempt > 0)
      }

      return await operation()
    } catch (err) {
      lastErr = err

      // Auth failures → logout immediately, no retry
      if (err.code === 'permission-denied' || err.code === 'unauthenticated') {
        await handleAuthFailure()
        throw normalizeError(err)
      }

      // Transient error and retries left → wait and retry
      if (isRetryable(err) && attempt < retries) {
        await sleep(400 * 2 ** attempt) // 400ms, 800ms, …
        continue
      }

      break
    }
  }

  throw normalizeError(lastErr)
}
