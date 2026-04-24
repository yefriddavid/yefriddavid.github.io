import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/vehicleLocationHistoryActions'
import * as service from '../../services/firebase/taxi/vehicleLocationHistory'

export function* fetchHistory({ payload }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getHistory, payload?.vehicleId)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createHistoryEntry({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addHistoryEntry, payload)
    yield put(
      actions.successRequestCreate({
        id,
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    )
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

export function* deleteHistoryEntry({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteHistoryEntry, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export function* fetchRecentHistory({ payload }) {
  const { vehicleId, plate } = payload
  try {
    const data = yield call(service.getHistory, vehicleId, plate)
    yield put(actions.fetchRecentSuccess({ vehicleId, data }))
  } catch (e) {
    yield put(actions.fetchRecentError({ vehicleId }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchHistory),
    takeLatest(actions.createRequest, createHistoryEntry),
    takeLatest(actions.deleteRequest, deleteHistoryEntry),
    takeEvery(actions.fetchRecentRequest, fetchRecentHistory),
  ])
}
