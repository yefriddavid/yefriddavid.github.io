import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as paymentVaucherActions from '../../actions/cashflow/paymentVaucherActions'
import * as apiPaymentVaucherServices from '../../services/firebase/cashflow/paymentVaucher'
import { createPaymentVaucher } from '../cashflow/paymentVaucherSagas'

describe('paymentVaucherSagas', () => {
  describe('createPaymentVaucher', () => {
    it('beginRequestCreate → CreatePaymentVaucher(payload) → successRequestCreate(response.data)', () => {
      const payload = { paymentId: 'pay-1', vaucher: 'data:image/png;base64,...' }
      const response = { data: { voucherId: 'v-1' } }
      const gen = createPaymentVaucher({ payload })

      expect(gen.next().value).toEqual(put(paymentVaucherActions.beginRequestCreate()))
      expect(gen.next().value).toEqual(
        call(apiPaymentVaucherServices.CreatePaymentVaucher, payload),
      )
      expect(gen.next(response).value).toEqual(
        put(paymentVaucherActions.successRequestCreate(response.data)),
      )
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestCreate on failure', () => {
      const gen = createPaymentVaucher({ payload: { paymentId: 'pay-1' } })
      gen.next() // beginRequestCreate
      gen.next() // call CreatePaymentVaucher
      expect(gen.throw(new Error('upload failed')).value).toEqual(
        put(paymentVaucherActions.errorRequestCreate('upload failed')),
      )
    })
  })
})
