import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/taxiDriverActions'
import * as service from '../../services/providers/firebase/CashFlow/taxiDrivers'

function* fetchDrivers() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getDrivers)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createDriver({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addDriver, payload)
    yield put(actions.successRequestCreate({
      id,
      ...payload,
      defaultAmount: payload.defaultAmount ? Number(payload.defaultAmount) : null,
      defaultAmountSunday: payload.defaultAmountSunday ? Number(payload.defaultAmountSunday) : null,
      defaultVehicle: payload.defaultVehicle || null,
    }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateDriver({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateDriver, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteDriver({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteDriver, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDrivers),
    takeLatest(actions.createRequest, createDriver),
    takeLatest(actions.updateRequest, updateDriver),
    takeLatest(actions.deleteRequest, deleteDriver),
  ])
}
