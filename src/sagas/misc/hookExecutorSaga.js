import { call, put, takeEvery } from 'redux-saga/effects'
import { triggerHook, resolveHook } from '../../reducers/system/programHookSlice'
import { push as notify } from '../../reducers/notificationsSlice'
import { getHookPrograms, runProgram } from '../../utils/programRunner'

function* executeHook({ payload: { id, tag, context } }) {
  const programs = getHookPrograms(tag)
  for (const program of programs) {
    const result = yield call(runProgram, program)
    if (result) {
      yield put(notify({ type: 'hook-output', program: program.name, output: result, context }))
    }
  }
  yield put(resolveHook(id))
}

export default function* hookExecutorSaga() {
  yield takeEvery(triggerHook, executeHook)
}
