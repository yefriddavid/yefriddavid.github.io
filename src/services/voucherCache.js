const PREFIX = 'vchr_'

export const getCache = (paymentId) => {
  try {
    return localStorage.getItem(PREFIX + paymentId)
  } catch {
    return null
  }
}

export const setCache = (paymentId, value) => {
  try {
    localStorage.setItem(PREFIX + paymentId, value)
  } catch {
    // Quota exceeded — ignorar silenciosamente
  }
}

export const clearCache = (paymentId) => {
  try {
    localStorage.removeItem(PREFIX + paymentId)
  } catch {}
}
