import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCommandActions'
import * as service from '../../services/firebase/domotica/domoticaCommand'

function* fetchCommands() {
  try {
    const data = yield call(service.fetchCommands)
    yield put(actions.fetchSuccess(data))
  } catch (e) {
    yield put(actions.fetchError(e.message))
  }
}

function* updateCommand({ payload }) {
  try {
    const { id, ...fields } = payload
    yield call(service.updateCommand, id, fields)
    yield put(actions.updateSuccess({ id }))
  } catch (e) {
    yield put(actions.updateError({ id: payload.id, previous: !payload.read }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchCommands),
    takeEvery(actions.updateRequest, updateCommand),
  ])
}
