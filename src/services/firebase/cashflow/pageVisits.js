import { db, COL_PAGE_VISITS } from '../settings'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { firestoreCall } from '../firebaseClient'

const collectVisitorMeta = () => ({
  userAgent: navigator.userAgent,
  language: navigator.language,
  languages: navigator.languages?.join(', ') || '',
  referrer: document.referrer || 'direct',
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  platform: navigator.platform || '',
  cookiesEnabled: navigator.cookieEnabled,
  url: window.location.href,
})

const fetchGeoInfo = async () => {
  try {
    const res = await fetch('https://ipinfo.io/json')
    if (!res.ok) return {}
    const data = await res.json()
    return {
      ip: data.ip || '',
      city: data.city || '',
      region: data.region || '',
      country: data.country || '',
      org: data.org || '',
      loc: data.loc || '',
    }
  } catch {
    return {}
  }
}

export const trackPageVisit = async (page) => {
  if (import.meta.env.DEV) return
  try {
    const [geo, meta] = await Promise.all([fetchGeoInfo(), Promise.resolve(collectVisitorMeta())])
    await firestoreCall(() =>
      addDoc(collection(db, COL_PAGE_VISITS), {
        page,
        ...meta,
        ...geo,
        createdAt: serverTimestamp(),
      }),
    )
  } catch {}
}

export const getPageVisits = async () => {
  const q = query(collection(db, COL_PAGE_VISITS), orderBy('createdAt', 'desc'), limit(200))
  const snap = await firestoreCall(() => getDocs(q))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const deletePageVisit = async (id) => {
  await firestoreCall(() => deleteDoc(doc(db, COL_PAGE_VISITS, id)))
}
