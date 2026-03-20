import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as paymentActions from '../actions/paymentActions'
import * as apiServices from '../services/providers/api/payments'

function* fetchPayments({ payload }) {
  try {
    yield put(paymentActions.beginRequestFetch())
    const response = yield call(apiServices.fetchPayments, payload)
    yield put(paymentActions.successRequestFetch(response.data))
  } catch (e) {
    yield put(paymentActions.errorRequestFetch(e.message))
  }
}

function* createPayment({ payload }) {
  try {
    yield put(paymentActions.beginRequestCreate())
    const response = yield call(apiServices.createPayment, payload)
    yield put(paymentActions.successRequestCreate({ ...response.data, vaucher: payload.vaucher }))
  } catch (e) {
    yield put(paymentActions.errorRequestCreate(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(paymentActions.fetchRequest, fetchPayments),
    takeLatest(paymentActions.createRequest, createPayment),
  ])
}
