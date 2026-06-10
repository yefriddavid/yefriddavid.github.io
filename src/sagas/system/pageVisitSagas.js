import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/pageVisitActions'
import * as service from '../../services/firebase/cashflow/pageVisits'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchPageVisits() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getPageVisits)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* deletePageVisit({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deletePageVisit, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Registro eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

function* trackVisit({ payload }) {
  yield call(service.trackPageVisit, payload)
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchPageVisits),
    takeLatest(actions.deleteRequest, deletePageVisit),
    takeLatest(actions.trackVisitRequest, trackVisit),
  ])
}
