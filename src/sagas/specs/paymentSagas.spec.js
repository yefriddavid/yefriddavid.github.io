import { testSaga } from 'redux-saga-test-plan';
import { call, put, takeLatest } from 'redux-saga/effects'
import { createPayment } from '../paymentSagas'
import * as actions from '../../actions/paymentActions'
import { describe, it } from 'vitest'
import * as apiPaymentHttClient from '../../services/providers/api/payment'
import * as apiPaymentVaucerHttClient from '../../services/providers/firebase/paymentVaucher'

describe('paymentSaga', () => {

  const mockData = { id: 122, year: 2025, date: "", vaucher: "xxxxx", accountId: 25, comment: "test comment" }
  //const ID = "444-33-64"

  describe('createData', () => {

    it('should create data successfully', () => {

      testSaga(createPayment, actions.createRequest(mockData))
        .next()
        .put(actions.beginRequestCreate())
        .next()
        .call(apiPaymentHttClient.createPayment, mockData)
        .next({ data: mockData })
        .call(apiPaymentVaucerHttClient.createPaymentVaucher, mockData)
        .next()
        .put(actions.successRequestCreate(mockData))
        .next()
        .finish()
    })

    it('should create handle payment errors', () => {

      const errorMessage = 'Network Error';

      testSaga(createPayment, actions.createRequest(mockData))
        .next()
        .put(actions.beginRequestCreate())
        .next()
        .call(apiPaymentHttClient.createPayment, mockData)
        .throw(new Error(errorMessage))
        .put(actions.errorRequestCreate(errorMessage))
        .next()
        .finish();
    });
    it('should create handle payment vaucher errors', () => {

      const errorMessage = 'Network Error';

      testSaga(createPayment, actions.createRequest(mockData))
        .next()
        .put(actions.beginRequestCreate())
        .next()
        .call(apiPaymentHttClient.createPayment, mockData)
        .next({ data: mockData })
        .call(apiPaymentVaucerHttClient.createPaymentVaucher, mockData)
        .throw(new Error(errorMessage))
        .put(actions.errorRequestCreate(errorMessage))
        .next()
        .finish();
    });
  })

  describe('deleteData', () => {
    it('should delete handle payment successfully', () => {

      const errorMessage = 'Network Error';

      testSaga(deletePayment, actions.deleteRequest(mockData))
        .next()
        .put(actions.beginRequestDelete())
        .next()
        .call(apiPaymentHttClient.deletePayment, mockData)
        .next({ data: mockData })
        .call(apiPaymentVaucerHttClient.createPaymentVaucher, mockData)
        .next()
        .put(actions.errorRequestDelete(errorMessage))
        .next()
        .finish();

    });
  })

})

