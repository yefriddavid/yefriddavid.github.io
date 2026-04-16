import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/accountReducer'
import * as accountActions from '../../actions/cashflow/accountActions'
import { successRequestCreate, successRequestDelete } from '../../actions/cashflow/paymentActions'
import { makeAccount, makeAccountState, makePayment } from '../../__tests__/factories'

const initial = {
  error: null,
  fetching: false,
  data: null,
  isError: false,
  selectedAccount: null,
  selectedVaucher: null,
}

describe('accountReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchData clears data and stores filters', () => {
      const filters = { month: '2024-03' }
      const s = reducer({ ...initial, data: [{ id: 1 }] }, accountActions.fetchData(filters))
      expect(s.data).toBeNull()
      expect(s.filters).toEqual(filters)
    })

    it('beginRequest sets fetching', () => {
      expect(reducer(initial, accountActions.beginRequest()).fetching).toBe(true)
    })

    it('successRequest stores data and clears fetching', () => {
      const response = { data: { items: [makeAccount()] } }
      const s = reducer({ ...initial, fetching: true }, accountActions.successRequest(response))
      expect(s.data).toEqual(response)
      expect(s.fetching).toBe(false)
    })

    it('errorRequest sets isError, clears data to [], clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, accountActions.errorRequest('timeout'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('timeout')
      expect(s.data).toEqual([])
      expect(s.fetching).toBe(false)
    })
  })

  // ── Selection ──────────────────────────────────────────────────────────────
  describe('selection', () => {
    it('selectAccount stores the selected account', () => {
      const account = makeAccount()
      const s = reducer(initial, accountActions.selectAccount(account))
      expect(s.selectedAccount).toEqual(account)
    })

    it('selectVaucher stores the selected voucher', () => {
      const s = reducer(initial, accountActions.selectVaucher('vaucher-abc'))
      expect(s.selectedVaucher).toBe('vaucher-abc')
    })
  })

  // ── Append vouchers ────────────────────────────────────────────────────────
  describe('appendVauchersToAccount', () => {
    it('replaces matching account item by accountId and marks vaucherLoaded', () => {
      const existing = makeAccount({ accountId: 'acc-1', name: 'Original' })
      const state = makeAccountState({ data: { data: { items: [existing] } } })
      const updated = makeAccount({ accountId: 'acc-1', name: 'Updated', vaucherLoaded: false })

      const s = reducer(state, accountActions.appendVauchersToAccount(updated))
      expect(s.data.data.items[0].name).toBe('Updated')
      expect(s.data.data.items[0].vaucherLoaded).toBe(true)
    })

    it('is a no-op when accountId does not match any item', () => {
      const state = makeAccountState()
      const s = reducer(state, accountActions.appendVauchersToAccount({ accountId: 'nonexistent' }))
      expect(s.data.data.items[0].accountId).toBe('acc-1')
    })

    it('is a no-op when data is null', () => {
      const s = reducer(initial, accountActions.appendVauchersToAccount({ accountId: 'acc-1' }))
      expect(s.data).toBeNull()
    })
  })

  // ── Cross-domain: triggered by paymentActions ──────────────────────────────
  describe('triggered by paymentActions', () => {
    it('payment successRequestCreate clears selectedAccount', () => {
      const state = { ...initial, selectedAccount: makeAccount() }
      const s = reducer(state, successRequestCreate({}))
      expect(s.selectedAccount).toBeNull()
    })

    it('payment successRequestDelete removes payment from nested items and recalculates total', () => {
      const pay1 = makePayment({ paymentId: 'pay-1', value: 50000 })
      const pay2 = makePayment({ paymentId: 'pay-2', value: 30000 })
      const account = makeAccount({
        payments: { items: [pay1, pay2], total: 80000 },
      })
      const state = makeAccountState({ data: { data: { items: [account] } } })

      const s = reducer(state, successRequestDelete({ paymentId: 'pay-1' }))
      const items = s.data.data.items[0].payments.items
      expect(items).toHaveLength(1)
      expect(items[0].paymentId).toBe('pay-2')
      expect(s.data.data.items[0].payments.total).toBe(30000)
    })

    it('payment successRequestDelete is a no-op when data is null', () => {
      const s = reducer(initial, successRequestDelete({ paymentId: 'pay-1' }))
      expect(s.data).toBeNull()
    })
  })
})
