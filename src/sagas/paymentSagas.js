import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'
import { root } from 'postcss';
import * as paymentActions from '../actions/paymentActions'
import * as apiServices from '../services/providers/api/accounts'

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

function* createPayment() {
    try{
      const { payload: data } = yield take(`${paymentActions.createRequest}`)
      const response = yield call(apiService.createPayment, data)
      yield put(paymentActions.successRequestCreate(response.data))

    } catch (e) {

      yield put(paymentActions.errorRequestCreate(e.toString()))

    }
}

export default function* rootSagas() {

  // yield fork(fetchPayments)
  // yield fork(createPayment)
  //console.log("paymen sagas");
  yield all([
    takeLatest(fetchPayments.fetchRequest, fetchPayments),
    takeLatest(createPayment.createRequest, createPayment)
  ])

}
