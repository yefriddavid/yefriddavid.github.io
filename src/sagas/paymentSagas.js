import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'
//import { root } from 'postcss';
import * as paymentActions from '../actions/paymentActions'
import * as apiServices from '../services/providers/api/payment'
import * as firebaseServices from '../services/providers/firebase/paymentVaucher'

import { of } from 'rxjs'
import { map } from 'rxjs/operators'

const name$ = of('John')

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

function* deletePayment({ payload }) {
  try{

    yield put(paymentActions.beginRequestDelete())
    const response = yield call(apiServices.deletePayment, { paymentId: payload.id, year: payload.year })

    // delete vaucher
    const r = yield call(firebaseServices.deleteVaucherPayment, { paymentId: payload.id, year: payload.year })

    yield put(paymentActions.successRequestDelete({...response.data, vaucher: payload.vaucher}))

  } catch (e) {

    yield put(paymentActions.errorRequestCreate(e.message))

  }

}


function* createPayment({ payload }) {
    try{

      yield put(paymentActions.beginRequestCreate())
      const createdPaymentResponse = yield call(apiServices.createPayment, payload)
      const createdPaymentVaucherResponse = yield call(firebaseServices.createPaymentVaucher, payload)

      const result = { ...createdPaymentResponse.data, vaucher: payload.vaucher }
      yield put(paymentActions.successRequestCreate(result))
      //yield put(paymentActions.successRequestCreate({...response.data, vaucher: payload.vaucher}))

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

export {
  deletePayment,
  createPayment
}
