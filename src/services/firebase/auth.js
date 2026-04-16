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
import { auth } from 'src/services/firebase/settings'
import { getUserForAuth, hashPassword } from 'src/services/firebase/security/users'
import { createSession } from 'src/services/firebase/security/sessions'

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
export async function signIn(username, password) {
  const email = toAuthEmail(username)
  let firestoreUser = null

  // ── Step 1: try Firebase Auth ──────────────────────────────────────────────
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (firebaseErr) {
    // User not in Firebase Auth yet → legacy path
    if (
      firebaseErr.code === 'auth/user-not-found' ||
      firebaseErr.code === 'auth/invalid-credential' ||
      firebaseErr.code === 'auth/invalid-email'
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
    } else if (firebaseErr.code === 'auth/wrong-password') {
      throw new Error('Credenciales incorrectas')
    } else {
      throw new Error(firebaseErr.message)
    }
  }

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

  return {
    username: firestoreUser.username,
    name: firestoreUser.name,
    role: firestoreUser.role,
    landingPage: firestoreUser.landingPage || '/cash_flow/dashboard',
    sessionId,
    token,
  }
}

/**
 * Signs out from Firebase Auth and clears local state.
 */
export async function signOut() {
  await firebaseSignOut(auth).catch(() => {})
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('sessionId')
  localStorage.removeItem('landingPage')
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
 * Requires the current password for re-authentication.
 */
export async function changePassword(username, currentPassword, newPassword) {
  const user = auth.currentUser
  if (!user) throw new Error('No hay sesión activa')

  // Re-authenticate to confirm identity before sensitive operation
  const credential = EmailAuthProvider.credential(toAuthEmail(username), currentPassword)
  await reauthenticateWithCredential(user, credential)
  await firebaseUpdatePassword(user, newPassword)
}
