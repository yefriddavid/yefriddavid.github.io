import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaDeviceActions'
import * as service from '../../services/firebase/domotica/domoticaDevices'

function* fetchDevices() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchDevices)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createDevice({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createDevice, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateDevice({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDevice, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteDevice({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDevice, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDevices),
    takeLatest(actions.createRequest, createDevice),
    takeLatest(actions.updateRequest, updateDevice),
    takeLatest(actions.deleteRequest, deleteDevice),
  ])
}
