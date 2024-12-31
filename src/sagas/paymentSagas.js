import { put, call, take, fork, all } from 'redux-saga/effects'
import { root } from 'postcss';
import * as paymentActions from '../actions/paymentActions'
import * as apiServices from '../services/providers/api/accounts'

export function* fetchPayments() {
  while(true){
    try{
      const { payload } = yield take(`${accountActions.fetchRequest}`)
      yield put(accountActions.beginRequestFetch())
      yield call(apiServices.fetchPayments, payload)
      yield put(accountActions.successFetch(response.data))
      //alert("aca llego")
      //yield fork(logoutFlow)

      //yield fork(watchStartBackgroundApiTasks, request)
    } catch (e) {
      console.log(e);

    }
  }
}
export function* createPayment() {
  while(true){
    try{
      const { payload: data } = yield take(`${paymentActions.createRequest}`)
      const response = yield call(apiService.createPayment, data)
      yield put(accountActions.successRequestCreate(response.data))

    } catch (e) {

      yield put(paymentActions.errorRequestCreate(e.toString()))

    }
  }
}

export default function* rootSagas() {

  // yield fork(fetchPayments)
  // yield fork(createPayment)
console.log("paymen sagas");
  yield all([
    fork(fetchPayment),
    fork(createPayment)
  ])

}
