import { db, COL_FINANCE_SYNC_SESSIONS as COL } from '../settings'
import {
  doc,
  collection,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const sessionRef = (id) => doc(db, COL, id)
const incomingCol = (targetId) => collection(db, COL, targetId, 'incoming')
const incomingRef = (targetId, fromId) => doc(db, COL, targetId, 'incoming', fromId)
const candidatesRef = (targetId, fromId, role) =>
  collection(db, COL, targetId, 'incoming', fromId, `${role}Candidates`)

// Presence — one doc per online device, refreshed by a heartbeat.
export const createSession = (id, username, deviceType, dataVersion) =>
  firestoreCall(() =>
    setDoc(sessionRef(id), {
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      username,
      deviceType,
      dataVersion,
    }),
  )

export const touchSession = (id, dataVersion) =>
  firestoreCall(() => updateDoc(sessionRef(id), { lastSeen: serverTimestamp(), dataVersion }))

export const subscribePresence = (cb) => onSnapshot(collection(db, COL), cb)

export const deleteSession = (id) => firestoreCall(() => deleteDoc(sessionRef(id)))

// Pairwise connection signaling — each (targetId, fromId) pairing gets its own doc
// under the target's "incoming" subcollection, so a device can be reached by several
// peers at once (a single offer/answer field on the root doc only supports one).
export const writeConnectionOffer = (targetId, fromId, sdp) =>
  firestoreCall(() =>
    setDoc(incomingRef(targetId, fromId), { offerSdp: sdp, createdAt: serverTimestamp() }),
  )

export const writeConnectionAnswer = (targetId, fromId, sdp) =>
  firestoreCall(() => updateDoc(incomingRef(targetId, fromId), { answerSdp: sdp }))

export const subscribeIncoming = (targetId, cb) => onSnapshot(incomingCol(targetId), cb)

export const subscribeConnection = (targetId, fromId, cb) =>
  onSnapshot(incomingRef(targetId, fromId), cb)

export const addConnectionCandidate = (targetId, fromId, role, candidate) =>
  firestoreCall(() => addDoc(candidatesRef(targetId, fromId, role), candidate.toJSON()))

export const subscribeConnectionCandidates = (targetId, fromId, role, cb) =>
  onSnapshot(candidatesRef(targetId, fromId, role), cb)

export const deleteConnection = (targetId, fromId) =>
  firestoreCall(() => deleteDoc(incomingRef(targetId, fromId)))
