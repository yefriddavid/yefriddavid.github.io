import { db, FIREBASE_API_KEY } from '../settings'
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore'

const COL = 'users'

// SHA-256 via Web Crypto API (available in all modern browsers)
export const hashPassword = async (plainText) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Returns full doc including passwordHash — only for login validation
export const getUserForAuth = async (username) => {
  const snap = await getDoc(doc(db, COL, username))
  if (!snap.exists()) return null
  return { username: snap.id, ...snap.data() }
}

export const getUser = async (username) => {
  const snap = await getDoc(doc(db, COL, username))
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
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const { passwordHash: _, createdAt, ...rest } = d.data()
    return { username: d.id, ...rest, createdAt: createdAt?.toDate().toISOString() ?? null }
  })
}

export const createUser = async ({ username, name, role, email, active, password }) => {
  const passwordHash = await hashPassword(password)
  await setDoc(doc(db, COL, username), {
    name,
    role,
    email: email || null,
    avatar: null,
    active: active !== false,
    passwordHash,
    createdAt: serverTimestamp(),
  })
}

// Full update — used by admin Users module (has role + active)
export const updateUser = async (username, { name, role, email, active }) => {
  await updateDoc(doc(db, COL, username), {
    name,
    role,
    email: email || null,
    active: active !== false,
  })
}

// Partial update — used by Profile page (only name/email/landingPage, no role/active)
export const updateOwnProfile = async (username, { name, email, landingPage }) => {
  await updateDoc(doc(db, COL, username), {
    name,
    email: email || null,
    landingPage: landingPage || null,
  })
}

export const updatePassword = async (username, newPassword) => {
  const passwordHash = await hashPassword(newPassword)
  await updateDoc(doc(db, COL, username), { passwordHash })
}

export const updateUserAvatar = async (username, avatar) => {
  await updateDoc(doc(db, COL, username), { avatar })
}

export const deleteUser = async (username) => {
  await deleteDoc(doc(db, COL, username))
}

// Admin: sends password reset — placeholder for when Firebase Auth is enabled
export const sendUserPasswordReset = async (_email) => {
  throw new Error('Requiere activar Firebase Authentication en la consola de Firebase')
}

// Own password change via hash update
export const changeOwnPassword = async (username, _currentPassword, newPassword) => {
  await updatePassword(username, newPassword)
}
