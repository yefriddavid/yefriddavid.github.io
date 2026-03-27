import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Contratos/contractAttachmentActions'
import * as service from '../../services/providers/firebase/Contratos/contractAttachments'

function* fetchAttachments({ payload }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAttachments, payload.contractId)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createAttachment({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addAttachment, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* deactivateAttachment({ payload }) {
  try {
    yield put(actions.beginRequestDeactivate())
    yield call(service.deactivateAttachment, payload.id)
    yield put(actions.successRequestDeactivate(payload))
  } catch (e) {
    yield put(actions.errorRequestDeactivate(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAttachments),
    takeLatest(actions.createRequest, createAttachment),
    takeLatest(actions.deactivateRequest, deactivateAttachment),
  ])
}
