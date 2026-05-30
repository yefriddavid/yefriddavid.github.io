import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as a from '../../actions/finance/pictureVersionsActions'
import * as svc from '../../services/facade/finance/pictureVersionsFacade'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchVersions({ payload }) {
  try {
    yield put(a.beginFetch())
    const data = yield call(svc.getPictureVersions, payload.pictureId)
    yield put(a.successFetch(data))
  } catch (e) {
    yield put(a.errorFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* createVersion({ payload }) {
  try {
    yield put(a.beginCreate())
    const id = yield call(svc.addPictureVersion, payload.pictureId, payload.data)
    yield put(a.successCreate({ id, ...payload.data }))
    yield put(notify({ type: 'success', message: 'Versión creada.' }))
  } catch (e) {
    yield put(a.errorCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* deleteVersion({ payload }) {
  try {
    yield put(a.beginDelete())
    yield call(svc.deletePictureVersion, payload.pictureId, payload.id)
    yield put(a.successDelete({ id: payload.id }))
    yield put(notify({ type: 'success', message: 'Versión eliminada.' }))
  } catch (e) {
    yield put(a.errorDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(a.fetchRequest,  fetchVersions),
    takeLatest(a.createRequest, createVersion),
    takeLatest(a.deleteRequest, deleteVersion),
  ])
}
