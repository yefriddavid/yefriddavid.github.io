import { describe, it, expect } from 'vitest'
import reducer from '../CashFlow/transactionReducer'
import * as actions from '../../actions/CashFlow/transactionActions'

const initial = {
  data: null,
  fetching: false,
  saving: false,
  error: {},
  isError: false,
  importing: false,
  importProgress: 0,
}

const makeTx = (overrides = {}) => ({
  id: 'tx-1',
  type: 'income',
  amount: 100000,
  date: '2026-04-10',
  accountMasterId: 'master-1',
  ...overrides,
})

describe('transactionReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const state = reducer({ ...initial, isError: true }, actions.fetchRequest({ year: 2026 }))
      expect(state.fetching).toBe(true)
      expect(state.isError).toBe(false)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data and clears fetching', () => {
      const payload = [makeTx()]
      const state = reducer({ ...initial, fetching: true }, actions.successRequestFetch(payload))
      expect(state.data).toEqual(payload)
      expect(state.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError, stores error, clears fetching', () => {
      const state = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
      expect(state.isError).toBe(true)
      expect(state.error).toBe('timeout')
      expect(state.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('beginRequestCreate sets saving', () => {
      expect(reducer(initial, actions.beginRequestCreate()).saving).toBe(true)
    })

    it('successRequestCreate prepends transaction to empty data', () => {
      const tx = makeTx()
      const state = reducer({ ...initial, saving: true, data: null }, actions.successRequestCreate(tx))
      expect(state.data).toEqual([tx])
      expect(state.saving).toBe(false)
    })

    it('successRequestCreate prepends transaction to existing data', () => {
      const existing = makeTx({ id: 'tx-old' })
      const newTx = makeTx({ id: 'tx-new' })
      const state = reducer(
        { ...initial, saving: true, data: [existing] },
        actions.successRequestCreate(newTx),
      )
      expect(state.data[0].id).toBe('tx-new')
      expect(state.data[1].id).toBe('tx-old')
      expect(state.saving).toBe(false)
    })

    it('errorRequestCreate stores error and clears saving', () => {
      const state = reducer({ ...initial, saving: true }, actions.errorRequestCreate('permission denied'))
      expect(state.error).toBe('permission denied')
      expect(state.saving).toBe(false)
      expect(state.isError).toBe(true)
    })
  })

  // ── Update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('beginRequestUpdate sets saving', () => {
      expect(reducer(initial, actions.beginRequestUpdate()).saving).toBe(true)
    })

    it('successRequestUpdate merges the updated transaction in place', () => {
      const tx = makeTx({ note: 'original' })
      const state = reducer(
        { ...initial, saving: true, data: [tx] },
        actions.successRequestUpdate({ ...tx, note: 'updated' }),
      )
      expect(state.data[0].note).toBe('updated')
      expect(state.saving).toBe(false)
    })

    it('successRequestUpdate is a no-op when data is null', () => {
      const state = reducer(
        { ...initial, saving: true, data: null },
        actions.successRequestUpdate(makeTx()),
      )
      expect(state.data).toBeNull()
      expect(state.saving).toBe(false)
    })

    it('successRequestUpdate does not touch unrelated transactions', () => {
      const tx1 = makeTx({ id: 'tx-1', note: 'keep' })
      const tx2 = makeTx({ id: 'tx-2', note: 'change' })
      const state = reducer(
        { ...initial, data: [tx1, tx2] },
        actions.successRequestUpdate({ ...tx2, note: 'changed' }),
      )
      expect(state.data[0].note).toBe('keep')
      expect(state.data[1].note).toBe('changed')
    })

    it('errorRequestUpdate stores error and clears saving', () => {
      const state = reducer({ ...initial, saving: true }, actions.errorRequestUpdate('write error'))
      expect(state.error).toBe('write error')
      expect(state.saving).toBe(false)
      expect(state.isError).toBe(true)
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes the transaction by id', () => {
      const tx1 = makeTx({ id: 'tx-1' })
      const tx2 = makeTx({ id: 'tx-2' })
      const state = reducer(
        { ...initial, data: [tx1, tx2] },
        actions.successRequestDelete({ id: 'tx-1' }),
      )
      expect(state.data).toHaveLength(1)
      expect(state.data[0].id).toBe('tx-2')
    })

    it('successRequestDelete is a no-op when data is null', () => {
      const state = reducer(initial, actions.successRequestDelete({ id: 'tx-1' }))
      expect(state.data).toBeNull()
    })

    it('errorRequestDelete sets isError and stores error', () => {
      const state = reducer(initial, actions.errorRequestDelete('not found'))
      expect(state.isError).toBe(true)
      expect(state.error).toBe('not found')
    })
  })
})
