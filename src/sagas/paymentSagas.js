import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'
//import { root } from 'postcss';
import * as paymentActions from '../actions/paymentActions'
import * as apiServices from '../services/providers/api/payments'

function* fetchPayments() {

    try{
      yield put(paymentActions.beginRequestFetch())
      yield call(apiServices.fetchPayments, payload)
      yield put(paymentActions.successFetch(response.data))
      //alert("aca llego")
      //yield fork(logoutFlow)

      //yield fork(watchStartBackgroundApiTasks, request)
    } catch (e) {
      console.log(e);

  }

}

function* createPayment({ payload }) {
    try{

      yield put(paymentActions.beginRequestCreate())
      const response = yield call(apiServices.createPayment, payload)
      yield put(paymentActions.successRequestCreate({...response.data, vaucher: payload.vaucher}))

    } catch (e) {
      yield put(paymentActions.errorRequestCreate(e.message))

    }
}

export default function* rootSagas() {

  yield all([
    takeLatest(paymentActions.fetchRequest, fetchPayments),
    takeLatest(paymentActions.createRequest, createPayment)
  ])

}
