import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'

import cloneDeep from 'lodash/cloneDeep';


import * as paymentActions from '../actions/paymentActions'
import * as accountActions from '../actions/accountActions'
import * as paymentVaucherActions from '../actions/paymentVaucherActions'

import * as apiServices from '../services/providers/api/accounts'
import * as apiPaymentVaucherServices from '../services/providers/firebase/paymentVaucher'

function* addVauchersToAccountPayments({ payload }) {

  try{

    //console.log(account);
    const account = cloneDeep(payload)
    const payments = account?.payments?.items
    const vauchers = yield call(apiPaymentVaucherServices.fetchVaucherPaymentMultiple, payments)

    vauchers.map( (v) => {

      const payment = payments.find( i => i.paymentId == v.paymentId )
      if (payment) {
        payment.vaucher = v.vaucher

      }

    })
    yield put(accountActions.appendVaucherToPayment(account))

    //}
    // console.log("calling");

    //yield put(accountActions.successFetch(response.data))

  } catch (e) {

    console.log(e);

  }

}
function* fetchPaymentVaucher() {

  try{

    //const { payload } = yield take(`${}`)
    //yield put(accountActions.beginRequestFetch())
    //yield call(apiServices.fetchPayments, payload)
    //yield put(accountActions.successFetch(response.data))

  } catch (e) {

    console.log(e);

  }

}

function* createPaymentVaucher() {
    try{
      const { payload } = yield take(`${accountActions.successRequestCreate}`)
      //yield put(accountActions.beginRequestFetch())
      //yield call(apiServices.fetchPayments, payload)
      //yield put(accountActions.successFetch(response.data))

    } catch (e) {
      console.log(e);

    }
}

export default function* rootSagas() {

  //alert("load vaucher saga")
  console.log(`${accountActions.selectAccount}`);
  yield all([
    takeLatest([accountActions.selectAccount], addVauchersToAccountPayments),
    takeLatest([paymentVaucherActions.fetchRequest], fetchPaymentVaucher),
    // fork(fetchPaymentVaucher)
  ])

}
