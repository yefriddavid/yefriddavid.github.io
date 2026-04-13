import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiVehicleActions'
import * as service from '../../services/providers/firebase/Taxi/taxiVehicles'
import { saveVehicles } from '../../services/providers/indexeddb/CashFlow/taxiVehicles'

function* fetchVehicles() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getVehicles)
    yield put(actions.successRequestFetch(data))
    try {
      yield call(saveVehicles, data)
    } catch (_) {
      // IDB sync failure is non-critical
    }
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createVehicle({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addVehicle, payload)
    yield put(actions.successRequestCreate({
      id,
      ...payload,
      plate: payload.plate?.toUpperCase(),
      restrictions: {},
    }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateVehicle({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateVehicle, payload.id, payload)
    yield put(actions.successRequestUpdate({ ...payload, plate: payload.plate?.toUpperCase() }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteVehicle({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteVehicle, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* updateRestrictions({ payload }) {
  try {
    yield call(service.updateRestrictions, payload.id, payload.restrictions)
    yield put(actions.successRequestUpdateRestrictions(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdateRestrictions(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchVehicles),
    takeLatest(actions.createRequest, createVehicle),
    takeLatest(actions.updateRequest, updateVehicle),
    takeLatest(actions.deleteRequest, deleteVehicle),
    takeLatest(actions.updateRestrictionsRequest, updateRestrictions),
  ])
}
