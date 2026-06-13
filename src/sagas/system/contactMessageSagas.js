import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/contactMessageActions'
import * as service from '../../services/firebase/system/contactMessages'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchContactMessages() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getContactMessages)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createContactMessage({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    yield call(service.saveContactMessage, payload)
    yield put(actions.successRequestCreate(payload))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al enviar mensaje: ${e.message}` }))
  }
}

function* deleteContactMessage({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteContactMessage, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Mensaje eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchContactMessages),
    takeLatest(actions.createRequest, createContactMessage),
    takeLatest(actions.deleteRequest, deleteContactMessage),
  ])
}
