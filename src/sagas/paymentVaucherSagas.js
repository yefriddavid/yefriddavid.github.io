import { put, call, take, fork, all, takeLatest } from 'redux-saga/effects'

import cloneDeep from 'lodash/cloneDeep';


//import * as paymentActions from '../actions/paymentActions'
import * as accountActions from '../actions/accountActions'
import * as paymentVaucherActions from '../actions/paymentVaucherActions'

import * as apiServices from '../services/providers/api/accounts'
import * as apiPaymentVaucherServices from '../services/providers/firebase/paymentVaucher'

function* addVauchersToAccountPayments({ payload }) {

  try {

    const account = cloneDeep(payload)
    const { payments } = account
    let { items: paymentItems } = payments

    /*items = items.map( e => {*/
    //console.log(paymentItems);
    /*paymentItems = paymentItems.map( e => {
    //console.log(e);
    return { ...e, vaucher: false }
  })*/
    //console.log(paymentItems);

    // const vauchers = yield call(apiPaymentVaucherServices.fetchVaucherPaymentMultiple, payments.items)


    if (paymentItems.filter(e => e.vaucher === false).length <= 0) {
      return
    }
    const vauchers = yield call(apiPaymentVaucherServices.fetchVaucherPaymentMultiple, paymentItems)

    paymentItems.map((v) => {

      // const paymentItem = paymentItems.find( i => i.paymentId == v.paymentId )
      const vaucherItem = vauchers.find(i => i.paymentId == v.paymentId)

      if (vaucherItem) {
        // paymentItem.vaucher = v.vaucher
        v.vaucher = vaucherItem.vaucher

      }
      else {
        v.vaucher = ""
      }

    })
    vauchers.map((v) => {
      //console.log(v);
      if (!v.vaucher || v.vaucher == "") {
        v.vaucher = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAAEsAAAAAQAAASwAAAAB/+0ALFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAPHAFaAAMbJUccAQAAAgAEAP/hDW5odHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0ltYWdlOjpFeGlmVG9vbCAxMS44OCc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp0aWZmPSdodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyc+CiAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICA8dGlmZjpYUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpYUmVzb2x1dGlvbj4KICA8dGlmZjpZUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpZUmVzb2x1dGlvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIFN0b2NrIFBsYXRmb3JtPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06RG9jdW1lbnRJRD54bXAuaWlkOjUxYmVmNDRjLWIxYzEtNDhkZi1hYWE5LTRlMmIzZjBmNjE0MDwveG1wTU06RG9jdW1lbnRJRD4KICA8eG1wTU06SW5zdGFuY2VJRD5hZG9iZTpkb2NpZDpzdG9jazo3NzUxNDFmNS1jMjAyLTQ0YzQtYmZhOS02MThiZmU4YjA1ODE8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpzdG9jazo3OTEyMjU5Mjc8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwAF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`

      }
      return v
    })

    yield put(accountActions.appendVauchersToAccount(account))

    //yield put(accountActions.successFetch(response.data))

  } catch (e) {

    console.log(e);

  }

}

function* editVaucherPayment({ payload }) {

  try {

    yield put(paymentVaucherActions.beginRequestEdit())
    const vaucher = yield call(apiPaymentVaucherServices.editVaucherPayment, payload)
    yield put(paymentVaucherActions.successRequestEdit(vaucher.data))

  } catch (e) {

    yield put(paymentVaucherActions.errorRequestEdit(e.message))

  }

}
function* fetchPaymentVaucher({ payload }) {

  try {

    yield put(paymentVaucherActions.beginRequestFetch())
    const vaucher = yield call(apiPaymentVaucherServices.fetchVaucherPayment, payload)
    yield put(paymentVaucherActions.successRequestFetch(vaucher.data))

  } catch (e) {

    yield put(paymentVaucherActions.errorRequestFetch(e.message))

  }

}

function* createPaymentVaucher({ payload }) {

  try {

    yield put(paymentVaucherActions.beginRequestCreate())
    const response = yield call(apiPaymentVaucherServices.createPaymentVaucher, payload)
    yield put(paymentVaucherActions.successRequestCreate(response.data))

  } catch (e) {
    yield put(paymentVaucherActions.errorRequestCreate(e.message))

  }
}

function* deletePaymentVaucher({ payload }) {

  try {

    yield put(paymentVaucherActions.beginRequestDelete())
    const response = yield call(apiPaymentVaucherServices.deleteVaucherPayment, payload)
    //console.log(response);
    yield put(paymentVaucherActions.successRequestDelete(response.data))
    //yield put(paymentVaucherActions.successRequestDelete(response.data))

  } catch (e) {
    yield put(paymentVaucherActions.errorRequestDelete(e.message))

  }
}
export default function* rootSagas() {

  yield all([
    takeLatest([accountActions.loadVauchersToAccountPayment], addVauchersToAccountPayments),
    takeLatest([paymentVaucherActions.fetchRequest], fetchPaymentVaucher),
    takeLatest([paymentActions.createRequest], createPaymentVaucher),
    takeLatest([paymentActions.deleteRequest], deletePaymentVaucher),
    takeLatest([paymentActions.editRequest], editVaucherPayment),
  ])

}

export {
  editVaucherPayment
  , fetchPaymentVaucher
  , createPaymentVaucher
  , deletePaymentVaucher
}
