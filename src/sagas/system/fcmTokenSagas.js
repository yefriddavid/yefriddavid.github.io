import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/fcmTokenActions'
import * as service from '../../services/firebase/security/fcmTokens'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchFcmTokens() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getTokens)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* deleteFcmToken({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteFcmToken, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Suscriptor eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchFcmTokens),
    takeLatest(actions.deleteRequest, deleteFcmToken),
  ])
}
