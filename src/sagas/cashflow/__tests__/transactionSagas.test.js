import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../../actions/cashflow/transactionActions'
import * as service from '../../../services/facade/cashflow/transactionFacade'
import { fetchTransactions } from '../transactionSagas'

describe('transactionSagas', () => {
  describe('fetchTransactions', () => {
    it('passes the whole payload through to the service (month + debtAccountIds included)', () => {
      const payload = { month: '2026-08', debtAccountIds: ['acc-1', 'acc-2'] }
      const data = [{ id: 't1' }]
      const gen = fetchTransactions({ payload })

      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.getTransactions, payload))
      expect(gen.next(data).value).toEqual(put(actions.successRequestFetch(data)))
      expect(gen.next().done).toBe(true)
    })

    it('still works with a bare { year } payload (Transactions/Dashboard views)', () => {
      const payload = { year: 2026 }
      const gen = fetchTransactions({ payload })

      gen.next() // beginRequestFetch
      expect(gen.next().value).toEqual(call(service.getTransactions, payload))
    })

    it('dispatches errorRequestFetch on thrown exception', () => {
      const gen = fetchTransactions({ payload: {} })
      gen.next() // beginRequestFetch
      gen.next() // call getTransactions
      const error = new Error('permission-denied')
      const errorEffect = gen.throw(error).value
      expect(errorEffect).toEqual(put(actions.errorRequestFetch(error.message)))
    })
  })
})
