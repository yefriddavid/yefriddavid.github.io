import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCurrentActions'
import * as service from '../../services/firebase/domotica/domoticaCurrent'

function* fetchCurrentRecords({ payload } = {}) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchCurrentRecords, payload ?? {})
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createCurrentRecord({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createCurrentRecord, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateCurrentRecord({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateCurrentRecord, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteCurrentRecord({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteCurrentRecord, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchCurrentRecords),
    takeLatest(actions.createRequest, createCurrentRecord),
    takeLatest(actions.updateRequest, updateCurrentRecord),
    takeLatest(actions.deleteRequest, deleteCurrentRecord),
  ])
}
