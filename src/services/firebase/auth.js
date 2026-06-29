/**
 * firebaseAuth — Firebase Authentication service.
 *
 * Implements refresh token via Firebase Auth (email/password provider).
 * The Firebase SDK stores the refresh token in IndexedDB and automatically
 * issues a new ID token (valid 1h) when it expires — no manual handling needed.
 *
 * Username → Firebase Auth email convention: `${username}@cashflow.app`
 * This lets us keep username-based login without requiring real emails.
 *
 * Hybrid login strategy (backwards compatible):
 *   1. Try Firebase Auth  (users already migrated)
 *   2. Fall back to Firestore hash check  (legacy users)
 *   3. On legacy success → auto-create Firebase Auth account (lazy migration)
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth, authTaxi, authDomotica } from 'src/services/firebase/settings'
import {
  getUserForAuth,
  hashPassword,
  updatePassword as updatePasswordHash,
} from 'src/services/firebase/security/users'
import { createSession } from 'src/services/firebase/security/sessions'
import { clearTenantId } from 'src/services/tenantContext'
import { authStorage } from 'src/utils/storage'
import { emitAuthSignedOut } from 'src/utils/broadcastChannel'

// ── Convention ─────────────────────────────────────────────────────────────────

/** Converts a username to a Firebase Auth synthetic email */
export const toAuthEmail = (username) => `${username.toLowerCase().trim()}@cashflow.app`

// ── Core auth operations ───────────────────────────────────────────────────────

/**
 * Signs in with Firebase Auth (email/password).
 * Falls back to legacy Firestore hash check and auto-migrates the account.
 *
 * @returns {{ username, name, role, landingPage, sessionId }}
 */
export async function signIn(username, password, onStep) {
  const email = toAuthEmail(username)
  let firestoreUser = null

  // ── Step 1: try Firebase Auth ──────────────────────────────────────────────
  try {
    await signInWithEmailAndPassword(auth, email, password)
    // Wait for onAuthStateChanged to fire so the Firestore SDK has the new auth
    // token before we make any reads. Without this there is a race condition:
    // signInWithEmailAndPassword resolves but Firestore's internal auth listener
    // hasn't processed the new session yet, causing permission-denied on the
    // very next getDoc call.
    await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) { unsub(); resolve() }
      })
    })
  } catch (firebaseErr) {
    // User not in Firebase Auth yet → legacy path
    if (
      firebaseErr.code === 'auth/user-not-found' ||
      firebaseErr.code === 'auth/invalid-credential' ||
      firebaseErr.code === 'auth/invalid-email' ||
      firebaseErr.code === 'auth/operation-not-allowed' ||
      // Admin may have reset the Firestore hash without updating Firebase Auth
      firebaseErr.code === 'auth/wrong-password'
    ) {
      // ── Step 2: legacy Firestore hash check ─────────────────────────────────
      firestoreUser = await getUserForAuth(username.trim())
      if (!firestoreUser) throw new Error('Credenciales incorrectas')
      if (firestoreUser.active === false) throw new Error('Usuario inactivo')

      const inputHash = await hashPassword(password)
      if (inputHash !== firestoreUser.passwordHash) throw new Error('Credenciales incorrectas')

      // ── Step 3: auto-create Firebase Auth account (lazy migration) ───────────
      try {
        await createUserWithEmailAndPassword(auth, email, password)
      } catch {
        // If creation fails (already exists with different password, etc.) continue anyway
        // The user is authenticated via legacy method for this session
      }
    } else {
      throw new Error(firebaseErr.message)
    }
  }
  onStep?.(1)

  // ── Sign in to taxi Firebase project ──────────────────────────────────────
  try {
    await signInWithEmailAndPassword(authTaxi, email, password)
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      await createUserWithEmailAndPassword(authTaxi, email, password).catch(() => {})
    }
  }
  onStep?.(2)

  // ── Sign in to domotica Firebase project ───────────────────────────────────
  try {
    await signInWithEmailAndPassword(authDomotica, email, password)
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      await createUserWithEmailAndPassword(authDomotica, email, password).catch(() => {})
    }
  }
  onStep?.(3)

  // ── Fetch Firestore profile (always needed for role, name, etc.) ───────────
  if (!firestoreUser) {
    firestoreUser = await getUserForAuth(username.trim())
  }
  if (!firestoreUser) throw new Error('Perfil no encontrado')
  if (firestoreUser.active === false) throw new Error('Usuario inactivo')

  // ── Create Firestore session record ───────────────────────────────────────
  const sessionId = crypto.randomUUID()
  const token = auth.currentUser
    ? await auth.currentUser.getIdToken()
    : btoa(`${username}:${Date.now()}`)

  await createSession(sessionId, firestoreUser.username, token).catch(() => {})
  onStep?.(4)

  return {
    username: firestoreUser.username,
    name: firestoreUser.name,
    role: firestoreUser.role,
    landingPage: firestoreUser.landingPage || '/finance/dashboard',
    sessionId,
    token,
  }
}

/**
 * Signs out from Firebase Auth and clears local state.
 */
export async function signOut() {
  await Promise.all([
    firebaseSignOut(auth).catch(() => {}),
    firebaseSignOut(authTaxi).catch(() => {}),
    firebaseSignOut(authDomotica).catch(() => {}),
  ])
  clearTenantId()
  authStorage.clearSession()
  emitAuthSignedOut()
}

/**
 * Returns a fresh Firebase ID token (auto-refreshes if expired).
 * Returns null if no user is signed in.
 */
export async function getToken() {
  if (!auth.currentUser) return null
  return auth.currentUser.getIdToken()
}

/**
 * Forces an immediate token refresh.
 * Call this after a 401 response from any API.
 */
export async function forceTokenRefresh() {
  if (!auth.currentUser) return null
  return auth.currentUser.getIdToken(true)
}

/**
 * Subscribes to Firebase Auth state changes.
 * The callback receives the Firebase User object or null.
 * Returns the unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Changes the current user's password.
 * Handles both Firebase Auth sessions and legacy-only (Firestore hash) sessions.
 * Always keeps the Firestore hash in sync with Firebase Auth.
 */
export async function changePassword(username, currentPassword, newPassword) {
  const user = auth.currentUser

  if (user) {
    // Firebase Auth session — reauthenticate then update Firebase Auth password
    const credential = EmailAuthProvider.credential(toAuthEmail(username), currentPassword)
    await reauthenticateWithCredential(user, credential)
    await firebaseUpdatePassword(user, newPassword)
  } else {
    // Legacy-only session (no Firebase Auth) — verify against Firestore hash
    const profile = await getUserForAuth(username)
    if (!profile) throw new Error('Usuario no encontrado')
    const inputHash = await hashPassword(currentPassword)
    if (inputHash !== profile.passwordHash) throw new Error('Contraseña actual incorrecta')
  }

  // Keep Firestore hash in sync so the hybrid login fallback stays consistent
  await updatePasswordHash(username, newPassword)
}
