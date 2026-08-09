import { call, put, select, takeEvery } from 'redux-saga/effects'
import { triggerHook, resolveHook } from '../../reducers/system/programHookSlice'
import { push as notify } from '../../reducers/notificationsSlice'
import { getHookPrograms, runProgram, resolveArgs } from '../../utils/programRunner'

function* executeHook({ payload: { id, tag, context } }) {
  const allPrograms = yield select((s) => s.program.data)
  const programs = getHookPrograms(allPrograms, tag)
  for (const program of programs) {
    const resolved = { ...program, args: resolveArgs(program.args, context) }
    const result = yield call(runProgram, resolved)
    if (result) {
      yield put(notify({ type: 'hook-output', program: program.name, output: result, context }))
    }
  }
  yield put(resolveHook(id))
}

export default function* hookExecutorSaga() {
  yield takeEvery(triggerHook, executeHook)
}
