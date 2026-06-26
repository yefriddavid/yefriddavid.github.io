import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { resolveHook } from '../reducers/system/programHookSlice'
import * as errorLogActions from '../actions/system/errorLogActions'
import { logRequest as auditLog } from '../actions/system/auditLogActions'

const STORAGE_KEY = 'localrunner_programs'

const loadPrograms = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function useProgramHooks() {
  const pending = useSelector((s) => s.programHook.pending)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!pending.length) return

    const extId = sessionStorage.getItem('__localrunner_ext_id__')
    if (!extId || typeof chrome === 'undefined' || !chrome.runtime) return

    const programs = loadPrograms()

    pending.forEach((hook) => {
      dispatch(resolveHook(hook.id))

      const matches = programs.filter((p) => p.hooks?.includes(hook.tag))
      matches.forEach((program) => {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(extId, { binary: program.binary, args: program.args }, (response) => {
          // eslint-disable-next-line no-undef
          const runtimeErr = chrome.runtime.lastError?.message
          const err = runtimeErr || response?.error

          dispatch(
            auditLog({
              operation: 'HOOK',
              entity: 'program',
              hook: hook.tag,
              program: program.name,
              binary: program.binary,
              exitCode: response?.exitCode ?? null,
              stdout: response?.stdout ?? null,
              stderr: response?.stderr ?? null,
              error: err ?? null,
            }),
          )

          if (err) {
            dispatch(
              errorLogActions.createRequest({
                source: `hook:${hook.tag}`,
                program: program.name,
                binary: program.binary,
                error: err,
                timestamp: new Date().toISOString(),
              }),
            )
          }
        })
      })
    })
  }, [pending, dispatch])
}
