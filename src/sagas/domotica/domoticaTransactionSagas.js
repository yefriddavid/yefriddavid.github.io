import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaTransactionActions'
import * as service from '../../services/firebase/domotica/domoticaTransactions'

const getLast24hRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - 24)
  return { startDate, endDate }
}

function* fetchTransactions() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchTransactions)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createTransaction({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createTransaction, payload)
    yield put(actions.successRequestCreate({ id, ...payload, amount: Number(payload.amount) }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateTransaction({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateTransaction, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteTransaction({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteTransaction, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* fetchVoltageHistory() {
  try {
    const { startDate, endDate } = getLast24hRange()
    const data = yield call(service.fetchVoltageHistory, { startDate, endDate })
    yield put(actions.fetchVoltageSuccess(data))
  } catch (e) {
    yield put(actions.fetchVoltageError(e.message))
  }
}

function* fetchCurrentHistory() {
  try {
    const { startDate, endDate } = getLast24hRange()
    const data = yield call(service.fetchCurrentHistory, { startDate, endDate })
    yield put(actions.fetchCurrentSuccess(data))
  } catch (e) {
    yield put(actions.fetchCurrentError(e.message))
  }
}

function* cleanupPreview({ payload }) {
  try {
    const docs = yield call(service.fetchTransactionsByRange, payload)
    yield put(actions.cleanupPreviewSuccess(docs))
  } catch (e) {
    yield put(actions.cleanupPreviewError(e.message))
  }
}

function* cleanupDelete({ payload }) {
  try {
    const deleted = yield call(service.deleteTransactionsByRange, payload)
    yield put(actions.cleanupDeleteSuccess(deleted))
  } catch (e) {
    yield put(actions.cleanupDeleteError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchTransactions),
    takeLatest(actions.createRequest, createTransaction),
    takeLatest(actions.updateRequest, updateTransaction),
    takeLatest(actions.deleteRequest, deleteTransaction),
    takeLatest(actions.fetchVoltageRequest, fetchVoltageHistory),
    takeLatest(actions.fetchCurrentRequest, fetchCurrentHistory),
    takeLatest(actions.cleanupPreviewRequest, cleanupPreview),
    takeLatest(actions.cleanupDeleteRequest, cleanupDelete),
  ])
}
