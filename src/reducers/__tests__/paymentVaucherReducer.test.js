import { describe, it, expect } from 'vitest'
import reducer from '../paymentVaucherReducer'
import * as paymentActions from '../../actions/paymentActions'
import * as vaucherActions from '../../actions/paymentVaucherActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('paymentVaucherReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Cross-domain trigger ───────────────────────────────────────────────────
  describe('triggered by paymentActions', () => {
    it('payment successRequestCreate stores payload as filters', () => {
      const payload = { paymentId: 'pay-1', vaucher: 'abc' }
      const s = reducer(initial, paymentActions.successRequestCreate(payload))
      expect(s.filters).toEqual(payload)
    })
  })

  // ── Create voucher ─────────────────────────────────────────────────────────
  describe('create', () => {
    it('beginRequestCreate sets fetching', () => {
      expect(reducer(initial, vaucherActions.beginRequestCreate()).fetching).toBe(true)
    })

    it('successRequestCreate clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, vaucherActions.successRequestCreate({}))
      expect(s.fetching).toBe(false)
    })

    it('errorRequestCreate sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, vaucherActions.errorRequestCreate('upload failed'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('upload failed')
      expect(s.fetching).toBe(false)
    })
  })
})
