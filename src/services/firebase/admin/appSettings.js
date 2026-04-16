import { db, COL_APP_SETTINGS } from '../settings'
import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

//const COL = 'App_settings'

export const SETTING_LABELS = {
  egg_current_price: 'Precio actual del huevo',
}

export const getAppSettings = () =>
  firestoreCall(async () => {
    const snap = await getDocs(collection(db, COL_APP_SETTINGS))
    return snap.docs.map((d) => ({ key: d.id, value: d.data().value ?? '', ...d.data() }))
  })

export const setAppSetting = (key, value) =>
  firestoreCall(() =>
    setDoc(
      doc(db, COL_APP_SETTINGS, key),
      { value, updatedAt: serverTimestamp() },
      { merge: true },
    ),
  )
