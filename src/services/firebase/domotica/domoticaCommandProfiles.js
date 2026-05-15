import {
  dbDomotica as db,
  COL_DOMOTICA_COMMAND_PROFILES,
  COL_DOMOTICA_COMMAND_PROFILE_ITEMS,
} from '../settings'
import { domoticaCall as firestoreCall } from '../firebaseClient'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

const mapProfile = (d) => {
  const data = d.data()
  return {
    id: d.id,
    name: data.name ?? '',
    description: data.description ?? '',
    deviceModel: data.deviceModel ?? '',
  }
}

const mapItem = (d) => {
  const data = d.data()
  return {
    id: d.id,
    profileId: data.profileId,
    value: data.value ?? '',
    notes: data.notes ?? '',
    order: data.order ?? 0,
  }
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export const fetchProfiles = async () => {
  const q = query(collection(db, COL_DOMOTICA_COMMAND_PROFILES), orderBy('name', 'asc'))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapProfile)
}

export const createProfile = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_COMMAND_PROFILES), {
      name: data.name,
      description: data.description || '',
      deviceModel: data.deviceModel || '',
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateProfile = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_COMMAND_PROFILES, id), {
      name: data.name,
      description: data.description || '',
      deviceModel: data.deviceModel || '',
    }),
  )
}

export const deleteProfile = async (id) => {
  const itemsSnap = await firestoreCall(() =>
    getDocs(query(
      collection(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS),
      where('profileId', '==', id),
    )),
  )
  const batch = writeBatch(db)
  itemsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, COL_DOMOTICA_COMMAND_PROFILES, id))
  await firestoreCall(() => batch.commit())
}

// ── Profile Items ─────────────────────────────────────────────────────────────

export const fetchProfileItems = async (profileId) => {
  const q = query(
    collection(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS),
    where('profileId', '==', profileId),
  )
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map(mapItem).sort((a, b) => a.order - b.order)
}

export const createProfileItem = async (data) => {
  const ref = await firestoreCall(() =>
    addDoc(collection(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS), {
      profileId: data.profileId,
      value: data.value,
      notes: data.notes || '',
      order: data.order ?? 0,
      createdAt: serverTimestamp(),
    }),
  )
  return ref.id
}

export const updateProfileItem = async (id, data) => {
  await firestoreCall(() =>
    updateDoc(doc(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS, id), {
      value: data.value,
      notes: data.notes || '',
      order: data.order ?? 0,
    }),
  )
}

export const deleteProfileItem = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS, id)))
}

export const reorderProfileItems = async (items) => {
  const batch = writeBatch(db)
  items.forEach((item, i) => {
    batch.update(doc(db, COL_DOMOTICA_COMMAND_PROFILE_ITEMS, item.id), { order: i })
  })
  await firestoreCall(() => batch.commit())
}
