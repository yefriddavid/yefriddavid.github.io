import { db, auth, COL_USERS as COL } from '../settings'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'


// SHA-256 via Web Crypto API (available in all modern browsers)
export const hashPassword = async (plainText) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Returns full doc including passwordHash — only for login validation.
// Uses direct getDoc (no firestoreCall) to avoid the permission-denied → logout
// redirect that breaks the login flow before the session is established.
// Forces a token refresh so the Firestore SDK has the auth token before reading —
// without this there is a race condition where signInWithEmailAndPassword has set
// auth.currentUser but Firestore's internal auth listener hasn't fired yet.
export const getUserForAuth = async (username) => {
  if (auth.currentUser) await auth.currentUser.getIdToken()
  const snap = await getDoc(doc(db, COL, username))
  if (!snap.exists()) return null
  return { username: snap.id, ...snap.data() }
}

export const getUser = async (username) => {
  const snap = await firestoreCall(() => getDoc(doc(db, COL, username)))
  if (!snap.exists()) return null
  const { passwordHash: _, createdAt, ...rest } = snap.data()
  return {
    username: snap.id,
    ...rest,
    createdAt: createdAt?.toDate().toISOString() ?? null,
  }
}

export const getAllUsers = async () => {
  const q = query(collection(db, COL), orderBy('name', 'asc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => {
    const { passwordHash: _, createdAt, ...rest } = d.data()
    return { username: d.id, ...rest, createdAt: createdAt?.toDate().toISOString() ?? null }
  })
}

export const createUser = async ({ username, name, role, email, active, password }) => {
  const { encryptPassword } = await import('src/utils/cryptoHelper')
  const [passwordHash, salt] = await Promise.all([hashPassword(password), encryptPassword(password)])
  await firestoreCall(() =>
    setDoc(doc(db, COL, username), {
      name,
      role,
      email: email || null,
      avatar: null,
      active: active !== false,
      passwordHash,
      salt,
      createdAt: serverTimestamp(),
    }),
  )
}

// Full update — used by admin Users module (has role + active)
export const updateUser = async (username, { name, role, email, active, landingPage }) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, username), {
      name,
      role,
      email: email || null,
      active: active !== false,
      landingPage: landingPage || null,
    }),
  )
}

// Partial update — used by Profile page (only name/email/landingPage, no role/active)
export const updateOwnProfile = async (username, { name, email, landingPage }) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL, username), {
      name,
      email: email || null,
      landingPage: landingPage || null,
    }),
  )
}

export const updatePassword = async (username, newPassword) => {
  const passwordHash = await hashPassword(newPassword)
  await firestoreCall(() => updateDoc(doc(db, COL, username), { passwordHash }))
}

export const updateUserAvatar = async (username, avatar) => {
  await firestoreCall(() => updateDoc(doc(db, COL, username), { avatar }))
}

export const deleteUser = async (username) => {
  await firestoreCall(() => deleteDoc(doc(db, COL, username)))
}

export const setUserTenants = async (username, tenantIds) => {
  await firestoreCall(() => updateDoc(doc(db, COL, username), { tenantIds: tenantIds ?? [] }))
}

// Admin: sets a new password for a user.
// Updates Firestore hash + stores AES-encrypted password in `salt` for local Firebase Auth sync.
export const adminSetPassword = async (username, newPassword) => {
  const { encryptPassword } = await import('src/utils/cryptoHelper')
  const [passwordHash, salt] = await Promise.all([
    hashPassword(newPassword),
    encryptPassword(newPassword),
  ])
  await firestoreCall(() =>
    updateDoc(doc(db, COL, username), { passwordHash, salt }),
  )
}
