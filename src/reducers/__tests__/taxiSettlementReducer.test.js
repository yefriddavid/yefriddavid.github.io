import { describe, it, expect } from 'vitest'
import reducer from '../Taxi/taxiSettlementReducer'
import * as actions from '../../actions/Taxi/taxiSettlementActions'
import { makeSettlement } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiSettlementReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data and clears fetching', () => {
      const records = [makeSettlement()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(records))
      expect(s.data).toEqual(records)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('timeout')
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('successRequestCreate prepends (most recent first)', () => {
      const old = makeSettlement({ id: 's-old', date: '2024-03-01' })
      const fresh = makeSettlement({ id: 's-new', date: '2024-03-10' })
      const s = reducer({ ...initial, data: [old] }, actions.successRequestCreate(fresh))
      expect(s.data[0].id).toBe('s-new')
      expect(s.data[1].id).toBe('s-old')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data array when null', () => {
      const rec = makeSettlement()
      expect(reducer(initial, actions.successRequestCreate(rec)).data).toEqual([rec])
    })

    it('errorRequestCreate sets isError and error', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestCreate('forbidden'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('forbidden')
      expect(s.fetching).toBe(false)
    })
  })

  // ── Update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('beginRequestUpdate sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.beginRequestUpdate())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestUpdate merges fields for matching id', () => {
      const rec = makeSettlement({ id: 'r1', amount: 50000 })
      const s = reducer(
        { ...initial, data: [rec] },
        actions.successRequestUpdate({ id: 'r1', amount: 60000, comment: 'ajuste' }),
      )
      expect(s.data[0].amount).toBe(60000)
      expect(s.data[0].comment).toBe('ajuste')
      expect(s.data[0].driver).toBe(rec.driver)  // unchanged field preserved
      expect(s.fetching).toBe(false)
    })

    it('successRequestUpdate does not affect other records', () => {
      const r1 = makeSettlement({ id: 'r1', amount: 50000 })
      const r2 = makeSettlement({ id: 'r2', amount: 80000 })
      const s = reducer({ ...initial, data: [r1, r2] }, actions.successRequestUpdate({ id: 'r1', amount: 55000 }))
      expect(s.data.find((r) => r.id === 'r2').amount).toBe(80000)
    })

    it('successRequestUpdate is a no-op when data is null', () => {
      expect(reducer(initial, actions.successRequestUpdate({ id: 'r1' })).data).toBeNull()
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes record by id', () => {
      const r1 = makeSettlement({ id: 'r1' })
      const r2 = makeSettlement({ id: 'r2', date: '2024-03-11' })
      const s = reducer({ ...initial, data: [r1, r2] }, actions.successRequestDelete({ id: 'r1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('r2')
    })

    it('successRequestDelete is a no-op when data is null', () => {
      expect(reducer(initial, actions.successRequestDelete({ id: 'r1' })).data).toBeNull()
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })
})
