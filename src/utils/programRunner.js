import { authStorage } from './storage'
import { getTenantId } from '../services/tenantContext'

const STORAGE_KEY = 'localrunner_programs'

const loadPrograms = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export const getHookPrograms = (hookKey) => {
  if (authStorage.getRole() !== 'superAdmin') return []
  return loadPrograms().filter((p) => !p.disabled && p.hooks?.includes(hookKey))
}

// Substitutes {{varName}} placeholders in a program's configured args with
// values from the hook's context (e.g. {{id}} -> context.id, {{username}} ->
// context.username — the entity a hook acted on, e.g. the user created).
//
// tenantId and currentUserName are a different thing: they describe who/where
// the action ran (the logged-in admin and their active tenant), not the
// entity acted on, so they're always resolvable here regardless of hook —
// and deliberately not overridable by a hook's own context, since no hook
// should be able to spoof them.
export const resolveArgs = (args, context = {}) => {
  const fullContext = {
    ...context,
    tenantId: getTenantId(),
    currentUserName: authStorage.getUsername(),
  }
  return (args ?? []).map((arg) =>
    arg.replace(/\{\{(\w+)\}\}/g, (_, key) => fullContext[key] ?? ''),
  )
}

export const runProgram = (program) =>
  new Promise((resolve) => {
    const extId = sessionStorage.getItem('__localrunner_ext_id__')
    // eslint-disable-next-line no-undef
    if (!extId || typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) {
      resolve(null)
      return
    }
    try {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage(
        extId,
        { binary: program.binary, args: program.args },
        (response) => {
          // eslint-disable-next-line no-undef
          const runtimeErr = chrome?.runtime?.lastError?.message
          resolve(runtimeErr ? { error: runtimeErr } : (response ?? null))
        },
      )
    } catch (e) {
      resolve({ error: e.message })
    }
  })
