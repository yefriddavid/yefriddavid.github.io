import { db, COL_FINANCE_SYNC_SESSIONS as COL } from '../settings'
import {
  doc, collection, setDoc, updateDoc, addDoc, getDoc,
  onSnapshot, serverTimestamp, deleteDoc,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const sessionRef    = (id)       => doc(db, COL, id)
const candidatesRef = (id, role) => collection(db, COL, id, `${role}Candidates`)

export const createSession = (id) =>
  firestoreCall(() => setDoc(sessionRef(id), { createdAt: serverTimestamp() }))

export const writeOffer = (id, sdp) =>
  firestoreCall(() => updateDoc(sessionRef(id), { offerSdp: sdp }))

export const writeAnswer = (id, sdp) =>
  firestoreCall(() => updateDoc(sessionRef(id), { answerSdp: sdp }))

export const addCandidate = (id, role, candidate) =>
  firestoreCall(() => addDoc(candidatesRef(id, role), candidate.toJSON()))

export const getSession = (id) =>
  firestoreCall(() => getDoc(sessionRef(id)))

export const subscribeSession = (id, cb) =>
  onSnapshot(sessionRef(id), cb)

export const subscribeCandidates = (id, role, cb) =>
  onSnapshot(candidatesRef(id, role), cb)

export const deleteSession = (id) =>
  firestoreCall(() => deleteDoc(sessionRef(id)))
