import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/finance/cryptoPurchaseActions'
import * as service from '../../services/firebase/finance/cryptoPurchase'
import { push } from '../../reducers/notificationsSlice'

function* loadPurchases() {
  try {
    const purchases = yield call(service.fetchAll)
    yield put(actions.loadSuccess(purchases))
  } catch (e) {
    yield put(actions.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* savePurchase({ payload }) {
  try {
    const id = yield call(service.saveEntry, payload)
    yield put(actions.saveSuccess({ ...payload, id }))
    yield put(push({ type: 'success', message: 'Compra registrada correctamente.' }))
  } catch (e) {
    yield put(actions.saveError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* updatePurchase({ payload }) {
  try {
    yield call(service.updateEntry, payload)
    yield put(actions.updateSuccess(payload))
    yield put(push({ type: 'success', message: 'Compra actualizada correctamente.' }))
  } catch (e) {
    yield put(actions.updateError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deletePurchase({ payload }) {
  try {
    yield call(service.deleteEntry, payload.id)
    yield put(actions.deleteSuccess({ id: payload.id }))
    yield put(push({ type: 'success', message: 'Compra eliminada correctamente.' }))
  } catch (e) {
    yield put(actions.deleteError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaCryptoPurchases() {
  yield all([
    takeLatest(actions.loadRequest, loadPurchases),
    takeEvery(actions.saveRequest, savePurchase),
    takeEvery(actions.updateRequest, updatePurchase),
    takeLatest(actions.deleteRequest, deletePurchase),
  ])
}
