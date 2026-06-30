import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as paymentActions from '../../actions/cashflow/paymentActions'
import * as apiServices from '../../services/api/payments'
import { triggerHook } from '../../reducers/system/programHookSlice'

export function* fetchPayments({ payload }) {
  try {
    yield put(paymentActions.beginRequestFetch())
    const response = yield call(apiServices.fetchPayments, payload)
    yield put(paymentActions.successRequestFetch(response.data))
  } catch (e) {
    yield put(paymentActions.errorRequestFetch(e.message))
  }
}

export function* createPayment({ payload }) {
  try {
    yield put(paymentActions.beginRequestCreate())
    const response = yield call(apiServices.createPayment, payload)
    yield put(paymentActions.successRequestCreate({ ...response.data, vaucher: payload.vaucher }))
    yield put(triggerHook({ tag: 'payment.create', context: { id: response.data?.id } }))
  } catch (e) {
    yield put(paymentActions.errorRequestCreate(e.message))
  }
}

export function* deletePayment({ payload }) {
  try {
    yield put(paymentActions.beginRequestDelete())
    yield call(apiServices.deletePayment, payload)
    yield put(paymentActions.successRequestDelete(payload))
    yield put(triggerHook({ tag: 'payment.delete', context: { id: payload?.id } }))
  } catch (e) {
    yield put(paymentActions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(paymentActions.fetchRequest, fetchPayments),
    takeLatest(paymentActions.createRequest, createPayment),
    takeLatest(paymentActions.deleteRequest, deletePayment),
  ])
}
