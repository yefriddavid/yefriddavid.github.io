import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/assetActions'
import * as facade from '../../services/facade/cashflow/assetFacade'
import { push } from '../../reducers/notificationsSlice'

function* loadAssets() {
  try {
    const assets = yield call(facade.fetchAll)
    yield put(actions.loadSuccess(assets))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveAsset({ payload }) {
  try {
    yield call(facade.createAsset, payload)
    yield put(actions.saveSuccess(payload))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteAsset({ payload }) {
  try {
    yield call(facade.deleteAsset, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* syncAsset({ payload }) {
  try {
    yield call(facade.syncAssetToFirebase, payload)
    const syncedAt = new Date().toISOString()
    const updated = { ...payload, syncedAt }
    yield put(actions.syncSuccess(updated))
  } catch (e) {
    yield put(actions.syncError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* syncAllAssets({ payload }) {
  try {
    const result = yield call(facade.syncAll, payload)
    yield put(actions.syncAllSuccess(result))
  } catch (e) {
    yield put(actions.syncAllError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* importFromFirebase() {
  try {
    const assets = yield call(facade.importFromFirebase)
    yield put(actions.importSuccess(assets))
  } catch (e) {
    yield put(actions.importError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.loadRequest, loadAssets),
    takeEvery(actions.saveRequest, saveAsset),
    takeLatest(actions.deleteRequest, deleteAsset),
    takeEvery(actions.syncRequest, syncAsset),
    takeLatest(actions.syncAllRequest, syncAllAssets),
    takeLatest(actions.importRequest, importFromFirebase),
  ])
}
