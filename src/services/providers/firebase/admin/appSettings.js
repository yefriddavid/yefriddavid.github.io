import { db } from '../settings'
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const COL = 'app_settings'

export const SETTING_LABELS = {
  egg_current_price: 'Precio actual del huevo',
}

export const getAppSettings = () =>
  firestoreCall(async () => {
    const snap = await getDocs(collection(db, COL))
    return snap.docs.map((d) => ({ key: d.id, value: d.data().value ?? '', ...d.data() }))
  })

export const setAppSetting = (key, value) =>
  firestoreCall(() =>
    setDoc(
      doc(db, COL, key),
      { value, updatedAt: serverTimestamp() },
      { merge: true },
    ),
  )
