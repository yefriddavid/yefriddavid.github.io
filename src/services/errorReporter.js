import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, COL_SYSTEM_ERROR_LOGS } from './firebase/settings'
import { authStorage } from 'src/utils/storage'

const BUFFER_SIZE = 10

const actionBuffer = []

function safeSerialize(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return '[unserializable]'
  }
}

export const flightRecorderMiddleware = (store) => (next) => (action) => {
  const entry = {
    type: action.type,
    ts: new Date().toISOString(),
    payload: safeSerialize(action.payload),
  }
  if (actionBuffer.length >= BUFFER_SIZE) actionBuffer.shift()
  actionBuffer.push(entry)

  if (action.error === true && action.payload instanceof Error) {
    const state = store.getState()
    reportError(action.payload, action.type, {
      reduxState: {
        username: state.login?.username ?? null,
        currentRoute: window.location.hash,
      },
    })
  }

  return next(action)
}

export async function reportError(error, context = 'unknown', extra = {}) {
  try {
    await addDoc(collection(db, COL_SYSTEM_ERROR_LOGS), {
      timestamp: serverTimestamp(),
      context,
      message: error?.message ?? String(error),
      stack: error?.stack ?? null,
      url: window.location.href,
      username: authStorage.getUsername(),
      recentActions: [...actionBuffer],
      ...safeSerialize(extra),
    })
  } catch {
    // Silently fail — never throw from error reporting
  }
}
