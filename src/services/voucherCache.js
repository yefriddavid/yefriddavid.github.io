const PREFIX = 'vchr_'

export const getCache = (paymentId) => {
  try {
    return sessionStorage.getItem(PREFIX + paymentId)
  } catch {
    return null
  }
}

export const setCache = (paymentId, value) => {
  try {
    sessionStorage.setItem(PREFIX + paymentId, value)
  } catch {
    // Quota exceeded — ignorar silenciosamente
  }
}

export const clearCache = (paymentId) => {
  try {
    sessionStorage.removeItem(PREFIX + paymentId)
  } catch {}
}
