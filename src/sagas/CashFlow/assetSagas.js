import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/assetActions'
import * as idb from '../../services/providers/indexeddb/CashFlow/assets'
import * as fb from '../../services/providers/firebase/CashFlow/assets'

function* loadAssets() {
  try {
    const assets = yield call(idb.getAllAssets)
    yield put(actions.loadSuccess(assets))
  } catch (e) {
    yield put(actions.loadError(e.message))
  }
}

function* saveAsset({ payload }) {
  try {
    yield call(idb.saveAsset, payload)
    yield put(actions.saveSuccess(payload))
  } catch (e) {
    yield put(actions.saveError(e.message))
  }
}

function* deleteAsset({ payload }) {
  try {
    yield call(idb.deleteAsset, payload.id)
    yield call(fb.deleteAssetFromFirebase, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
  }
}

function* syncAsset({ payload }) {
  try {
    yield call(fb.syncAssetToFirebase, payload)
    const syncedAt = new Date().toISOString()
    const updated = { ...payload, syncedAt }
    yield call(idb.saveAsset, updated)
    yield put(actions.syncSuccess(updated))
  } catch (e) {
    yield put(actions.syncError(e.message))
  }
}

function* syncAllAssets({ payload }) {
  try {
    const now = new Date().toISOString()
    for (const asset of payload) {
      yield call(fb.syncAssetToFirebase, asset)
      yield call(idb.saveAsset, { ...asset, syncedAt: now })
    }
    const result = payload.map((a) => ({ id: a.id, syncedAt: now }))
    yield put(actions.syncAllSuccess(result))
  } catch (e) {
    yield put(actions.syncAllError(e.message))
  }
}

function* importFromFirebase() {
  try {
    const assets = yield call(fb.fetchAllFromFirebase)
    for (const asset of assets) {
      yield call(idb.saveAsset, asset)
    }
    yield put(actions.importSuccess(assets))
  } catch (e) {
    yield put(actions.importError(e.message))
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
