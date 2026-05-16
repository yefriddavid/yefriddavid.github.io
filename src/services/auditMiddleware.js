import { writeAuditLog } from './firebase/system/auditLogs'

// Matches createCRUDActions success write patterns
const WRITE_SUFFIXES = ['/createSuccess', '/updateSuccess', '/deleteSuccess']

const safeSerialize = (value) => {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return '[unserializable]'
  }
}

const resolveOperation = (type) => {
  if (type.endsWith('/createSuccess')) return 'CREATE'
  if (type.endsWith('/updateSuccess')) return 'UPDATE'
  if (type.endsWith('/deleteSuccess')) return 'DELETE'
  return null
}

export const auditMiddleware = (store) => (next) => (action) => {
  const result = next(action)

  if (WRITE_SUFFIXES.some((s) => action.type.endsWith(s))) {
    const state = store.getState()
    writeAuditLog({
      operation: resolveOperation(action.type),
      actionType: action.type,
      entity: action.type.split('/')[0],
      payload: safeSerialize(action.payload),
      username: state.profile?.data?.username ?? localStorage.getItem('username') ?? null,
      route: window.location.hash,
    })
  }

  return result
}
