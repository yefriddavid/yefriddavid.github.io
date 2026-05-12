const cache = new Map()

export function geoKey(lat, lng) {
  return `${Math.round(lat * 100) / 100},${Math.round(lng * 100) / 100}`
}

export async function reverseGeocode(lat, lng) {
  const key = geoKey(lat, lng)
  if (cache.has(key)) return cache.get(key)

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      { headers: { 'Accept-Language': 'es' } },
    )
    const data = await res.json()
    const addr = data.address || {}
    const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
    cache.set(key, name)
    return name
  } catch {
    cache.set(key, '')
    return ''
  }
}
