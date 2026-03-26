import { describe, it, expect } from 'vitest'
import reducer from '../CashFlow/taxiPartnerReducer'
import * as actions from '../../actions/CashFlow/taxiPartnerActions'
import { makePartner } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiPartnerReducer', () => {
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

    it('successRequestFetch stores partners', () => {
      const partners = [makePartner()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(partners))
      expect(s.data).toEqual(partners)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('successRequestCreate appends and sorts alphabetically by name', () => {
      const p1 = makePartner({ id: 'p1', name: 'Zoe Vega' })
      const p2 = makePartner({ id: 'p2', name: 'Alberto Cruz' })
      const s = reducer({ ...initial, data: [p1] }, actions.successRequestCreate(p2))
      expect(s.data[0].name).toBe('Alberto Cruz')
      expect(s.data[1].name).toBe('Zoe Vega')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const p = makePartner()
      expect(reducer(initial, actions.successRequestCreate(p)).data).toEqual([p])
    })
  })

  // ── Update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('beginRequestUpdate sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.beginRequestUpdate())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestUpdate merges fields and re-sorts', () => {
      const p1 = makePartner({ id: 'p1', name: 'Carlos Gil', percentage: 50 })
      const p2 = makePartner({ id: 'p2', name: 'Marta Rios', percentage: 50 })
      const s = reducer(
        { ...initial, data: [p1, p2] },
        actions.successRequestUpdate({ id: 'p2', name: 'Ana Mora', percentage: 45 }),
      )
      expect(s.data[0].name).toBe('Ana Mora')
      expect(s.data[0].percentage).toBe(45)
      expect(s.data[1].name).toBe('Carlos Gil')
      expect(s.fetching).toBe(false)
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('write error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('write error')
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes partner by id', () => {
      const p1 = makePartner({ id: 'p1' })
      const p2 = makePartner({ id: 'p2', name: 'Socio B' })
      const s = reducer({ ...initial, data: [p1, p2] }, actions.successRequestDelete({ id: 'p1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('p2')
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })
})
