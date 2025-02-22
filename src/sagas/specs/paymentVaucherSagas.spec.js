import { testSaga } from 'redux-saga-test-plan';
import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchPaymentVaucher, createPaymentVaucher, deletePaymentVaucher, editVaucherPayment } from '../paymentVaucherSagas'; // Tus sagas
import * as actions from '../../actions/paymentVaucherActions'; // Tus acciones
import axios from 'axios'; // O tu cliente HTTP
import { describe, it } from 'vitest'
import * as apiPaymentVaucherServices from '../../services/providers/firebase/paymentVaucher'

describe('paymentVauchersSaga', () => {

  const mockData = { id: 122, year: 2025 }
  const ID = "444-33-64"

  describe('fetchData', () => {

    it('should fetch data successfully', () => {
      testSaga(fetchPaymentVaucher, actions.fetchRequest(mockData))
        .next()
        .put(actions.beginRequestFetch())
        .next()
        .call(apiPaymentVaucherServices.fetchVaucherPayment, mockData)
        .next({ data: mockData })
        .put(actions.successRequestFetch(mockData))
        .next()
        .finish()
    })

    it('should fetch handle errors', () => {
      const errorMessage = 'Network Error';

      testSaga(fetchPaymentVaucher, actions.fetchRequest(mockData))
        .next()
        .put(actions.beginRequestFetch())
        .next()
        .call(apiPaymentVaucherServices.fetchVaucherPayment, mockData)
        .throw(new Error(errorMessage)) // Simulate an error
        .put(actions.errorRequestFetch(errorMessage)) // Check the error action
        .next()
        .finish();
    });

  });

  describe('deleteDataSaga', () => {
    const mockDelete = { status: 'ok', id: mockData.id }

    it('should delete data successfully', () => {
      testSaga(deletePaymentVaucher, actions.deleteRequest(mockDelete))
        .next()
        .put(actions.beginRequestDelete()) // Verifica la acción de éxito
        .next() // omitimos call api
        .call(apiPaymentVaucherServices.deleteVaucherPayment, mockDelete)
        .next({ data: mockDelete }) // Simula la respuesta exitosa
        .put(actions.successRequestDelete(mockDelete)) // Verifica la acción de éxito
        .next()
        .finish()
    })

    it('should delete handle errors', () => {
      const errorMessage = 'Network Error';

      testSaga(deletePaymentVaucher, actions.deleteRequest(mockData))
        .next()
        .put(actions.beginRequestDelete())
        .next()
        .call(apiPaymentVaucherServices.deleteVaucherPayment, mockData)
        .throw(new Error(errorMessage))
        .put(actions.errorRequestDelete(errorMessage))
        .next()
        .finish();
    });
  })

  describe('createDataSaga', () => {
    const mockCreate = { status: 'ok', id: mockData.id }

    it('should create data successfully', () => {
      testSaga(createPaymentVaucher, actions.createRequest(mockCreate))
        .next()
        .put(actions.beginRequestCreate())
        .next()
        .call(apiPaymentVaucherServices.createPaymentVaucher, mockCreate)
        .next({ data: mockCreate })
        .put(actions.successRequestCreate(mockCreate))
        .next()
        .finish()

    })

    it('should create handle errors', () => {
      const errorMessage = 'Network Error';

      testSaga(createPaymentVaucher, actions.editRequest(mockCreate))
        .next()
        .put(actions.beginRequestCreate())
        .next()
        .call(apiPaymentVaucherServices.createPaymentVaucher, mockCreate)
        .throw(new Error(errorMessage))
        .put(actions.errorRequestCreate(errorMessage))
        .next()
        .finish();

    });

  })
  describe('editDataSaga', () => {
    const mockEdit = { status: 'ok', id: mockData.id }

    it('should edit data successfully', () => {
      testSaga(editVaucherPayment, actions.editRequest(mockEdit))
        .next()
        .put(actions.beginRequestEdit())
        .next()
        .call(apiPaymentVaucherServices.editVaucherPayment, mockEdit)
        .next({ data: mockEdit })
        .put(actions.successRequestEdit(mockEdit))
        .next()
        .finish()
    })
    it('should edit handle errors', () => {
      const errorMessage = 'Network Error';

      testSaga(editVaucherPayment, actions.editRequest(mockEdit))
        .next()
        .put(actions.beginRequestEdit())
        .next()
        .call(apiPaymentVaucherServices.editVaucherPayment, mockEdit)
        .throw(new Error(errorMessage))
        .put(actions.errorRequestEdit(errorMessage))
        .next()
        .finish();

    });

  })

});

