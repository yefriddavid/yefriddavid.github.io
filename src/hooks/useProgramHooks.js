import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { resolveHook } from '../reducers/system/programHookSlice'
import * as errorLogActions from '../actions/system/errorLogActions'
import { logRequest as auditLog } from '../actions/system/auditLogActions'
import { getHookPrograms, resolveArgs } from '../utils/programRunner'

export default function useProgramHooks() {
  const pending = useSelector((s) => s.programHook.pending)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!pending.length) return

    const extId = sessionStorage.getItem('__localrunner_ext_id__')
    if (!extId || typeof chrome === 'undefined' || !chrome.runtime) return

    pending.forEach((hook) => {
      dispatch(resolveHook(hook.id))

      const matches = getHookPrograms(hook.tag)
      matches.forEach((program) => {
        const args = resolveArgs(program.args, hook.context)
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(extId, { binary: program.binary, args }, (response) => {
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
