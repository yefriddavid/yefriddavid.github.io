import { authStorage } from './storage'

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
