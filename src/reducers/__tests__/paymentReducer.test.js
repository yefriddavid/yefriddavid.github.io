import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/paymentReducer'
import * as actions from '../../actions/cashflow/paymentActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('paymentReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest stores filters from payload', () => {
      const filters = { accountId: 'acc-1', month: '2024-03' }
      const s = reducer(initial, actions.fetchRequest(filters))
      expect(s.filters).toEqual(filters)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data and clears fetching', () => {
      const data = [{ paymentId: 'pay-1', value: 50000 }]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(data))
      expect(s.data).toEqual(data)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ─────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('createRequest sets fetching', () => {
      expect(reducer(initial, actions.createRequest({})).fetching).toBe(true)
    })

    it('beginRequestCreate sets fetching', () => {
      expect(reducer(initial, actions.beginRequestCreate()).fetching).toBe(true)
    })

    it('successRequestCreate clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.successRequestCreate({}))
      expect(s.fetching).toBe(false)
    })

    it('errorRequestCreate sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestCreate('server error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('server error')
      expect(s.data).toEqual([])
      expect(s.fetching).toBe(false)
    })
  })

  // ── Delete ─────────────────────────────────────────────────────────────────
  // Note: paymentReducer does not handle beginRequestDelete/successRequestDelete/errorRequestDelete.
  // Those actions exist in paymentActions but only accountReducer reacts to successRequestDelete.
  describe('delete', () => {
    it('beginRequestDelete does not change state (unhandled action)', () => {
      expect(reducer(initial, actions.beginRequestDelete())).toEqual(initial)
    })
  })
})
