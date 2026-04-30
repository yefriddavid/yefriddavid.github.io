import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/taxi/taxiPeriodAttachmentActions'
import * as service from '../../services/firebase/taxi/taxiPeriodAttachments'

function* fetchAttachments({ payload }) {
  try {
    const data = yield call(service.fetchPeriodAttachments, payload.period)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createAttachment({ payload }) {
  try {
    const id = yield call(service.createPeriodAttachment, payload)
    const now = new Date().toISOString()
    yield put(actions.successRequestCreate({ id, ...payload, createdAt: now }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateAttachment({ payload }) {
  try {
    yield call(service.updatePeriodAttachment, payload.id, payload)
    yield put(actions.successRequestUpdate({ id: payload.id, description: payload.description }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteAttachment({ payload }) {
  try {
    yield call(service.deletePeriodAttachment, payload.id)
    yield put(actions.successRequestDelete({ id: payload.id }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAttachments),
    takeLatest(actions.createRequest, createAttachment),
    takeLatest(actions.updateRequest, updateAttachment),
    takeLatest(actions.deleteRequest, deleteAttachment),
  ])
}
