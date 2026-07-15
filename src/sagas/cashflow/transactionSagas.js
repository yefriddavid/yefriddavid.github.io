import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/transactionActions'
import * as service from '../../services/facade/cashflow/transactionFacade'
import { push } from '../../reducers/notificationsSlice'
import { triggerHook } from '../../reducers/system/programHookSlice'

export function* fetchTransactions({ payload }) {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getTransactions, payload?.year)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export function* createTransaction({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addTransaction, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(triggerHook({ tag: 'transaction.create', context: { id } }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export function* updateTransaction({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateTransaction, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(triggerHook({ tag: 'transaction.update', context: { id: payload.id } }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export function* deleteTransaction({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteTransaction, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(triggerHook({ tag: 'transaction.delete', context: { id: payload.id } }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export function* importTransactions({ payload }) {
  try {
    for (let i = 0; i < payload.length; i++) {
      yield call(service.addTransaction, payload[i])
      yield put(actions.importProgressUpdate(Math.round(((i + 1) / payload.length) * 100)))
    }
    const currentYear = new Date().getFullYear()
    const data = yield call(service.getTransactions, currentYear)
    yield put(actions.importComplete(data))
  } catch (e) {
    yield put(actions.importError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchTransactions),
    takeLatest(actions.createRequest, createTransaction),
    takeLatest(actions.updateRequest, updateTransaction),
    takeLatest(actions.deleteRequest, deleteTransaction),
    takeLatest(actions.importRequest, importTransactions),
  ])
}
