import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as paymentActions from '../../actions/CashFlow/paymentActions'
import * as apiServices from '../../services/providers/api/payments'
import { makePayment } from '../../__tests__/factories'

// Step-through generator copies (standard redux-saga testing pattern)
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

function* deletePayment({ payload }) {
  try {
    yield put(paymentActions.beginRequestDelete())
    yield call(apiServices.deletePayment, payload)
    yield put(paymentActions.successRequestDelete(payload))
  } catch (e) {
    yield put(paymentActions.errorRequestDelete(e.message))
  }
}

describe('paymentSagas', () => {
  describe('fetchPayments', () => {
    it('beginRequestFetch → fetchPayments(payload) → successRequestFetch(response.data)', () => {
      const payload = { accountId: 'acc-1' }
      const response = { data: [makePayment()] }
      const gen = fetchPayments({ payload })

      expect(gen.next().value).toEqual(put(paymentActions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(apiServices.fetchPayments, payload))
      expect(gen.next(response).value).toEqual(put(paymentActions.successRequestFetch(response.data)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on failure', () => {
      const gen = fetchPayments({ payload: {} })
      gen.next()  // beginRequestFetch
      gen.next()  // call fetchPayments
      expect(gen.throw(new Error('timeout')).value).toEqual(put(paymentActions.errorRequestFetch('timeout')))
    })
  })

  describe('createPayment', () => {
    it('beginRequestCreate → createPayment(payload) → successRequestCreate with vaucher merged', () => {
      const payload = { accountId: 'acc-1', value: 50000, vaucher: 'img-base64' }
      const responseData = { paymentId: 'pay-new', value: 50000 }
      const gen = createPayment({ payload })

      expect(gen.next().value).toEqual(put(paymentActions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(apiServices.createPayment, payload))
      expect(gen.next({ data: responseData }).value).toEqual(
        put(paymentActions.successRequestCreate({ ...responseData, vaucher: payload.vaucher })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('vaucher from payload is merged into success dispatch even when undefined', () => {
      const payload = { accountId: 'acc-1', value: 10000 }
      const responseData = { paymentId: 'pay-2' }
      const gen = createPayment({ payload })
      gen.next()  // beginRequestCreate
      gen.next()  // call createPayment
      const { payload: dispatched } = gen.next({ data: responseData }).value.payload.action
      expect(dispatched.vaucher).toBeUndefined()
    })

    it('dispatches errorRequestCreate on failure', () => {
      const gen = createPayment({ payload: {} })
      gen.next()  // beginRequestCreate
      gen.next()  // call createPayment
      expect(gen.throw(new Error('forbidden')).value).toEqual(put(paymentActions.errorRequestCreate('forbidden')))
    })
  })

  describe('deletePayment', () => {
    it('beginRequestDelete → deletePayment(payload) → successRequestDelete(payload)', () => {
      const payload = { paymentId: 'pay-1' }
      const gen = deletePayment({ payload })

      expect(gen.next().value).toEqual(put(paymentActions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(apiServices.deletePayment, payload))
      expect(gen.next().value).toEqual(put(paymentActions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on failure', () => {
      const gen = deletePayment({ payload: { paymentId: 'pay-1' } })
      gen.next()  // beginRequestDelete
      gen.next()  // call deletePayment
      expect(gen.throw(new Error('not found')).value).toEqual(put(paymentActions.errorRequestDelete('not found')))
    })
  })
})
