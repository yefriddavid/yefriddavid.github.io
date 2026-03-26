import { db } from '../settings'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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
  try {
    const [geo, meta] = await Promise.all([fetchGeoInfo(), Promise.resolve(collectVisitorMeta())])
    await addDoc(collection(db, 'page_visits'), {
      page,
      ...meta,
      ...geo,
      createdAt: serverTimestamp(),
    })
  } catch {}
}
