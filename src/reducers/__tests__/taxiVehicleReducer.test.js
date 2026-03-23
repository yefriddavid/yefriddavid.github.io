import { describe, it, expect } from 'vitest'
import reducer from '../taxiVehicleReducer'
import * as actions from '../../actions/taxiVehicleActions'
import { makeVehicle } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiVehicleReducer', () => {
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

    it('successRequestFetch stores data', () => {
      const vehicles = [makeVehicle()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(vehicles))
      expect(s.data).toEqual(vehicles)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('successRequestCreate appends and sorts by plate alphabetically', () => {
      const v1 = makeVehicle({ id: 'v1', plate: 'XYZ999' })
      const v2 = makeVehicle({ id: 'v2', plate: 'ABC001' })
      const s = reducer({ ...initial, data: [v1] }, actions.successRequestCreate(v2))
      expect(s.data[0].plate).toBe('ABC001')
      expect(s.data[1].plate).toBe('XYZ999')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const v = makeVehicle()
      expect(reducer(initial, actions.successRequestCreate(v)).data).toEqual([v])
    })
  })

  // ── Update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('successRequestUpdate merges fields and re-sorts by plate', () => {
      const v1 = makeVehicle({ id: 'v1', plate: 'AAA111' })
      const v2 = makeVehicle({ id: 'v2', plate: 'ZZZ999' })
      const s = reducer(
        { ...initial, data: [v1, v2] },
        actions.successRequestUpdate({ id: 'v2', plate: 'BBB222', brand: 'Toyota' }),
      )
      expect(s.data[0].plate).toBe('AAA111')
      expect(s.data[1].plate).toBe('BBB222')
      expect(s.data[1].brand).toBe('Toyota')
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('write error'))
      expect(s.isError).toBe(true)
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes vehicle by id', () => {
      const v1 = makeVehicle({ id: 'v1' })
      const v2 = makeVehicle({ id: 'v2', plate: 'XYZ999' })
      const s = reducer({ ...initial, data: [v1, v2] }, actions.successRequestDelete({ id: 'v1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('v2')
    })
  })

  // ── Restrictions ──────────────────────────────────────────────────────────
  describe('restrictions (pico y placa)', () => {
    it('successRequestUpdateRestrictions replaces restrictions for matching vehicle', () => {
      const v = makeVehicle({ id: 'v1', restrictions: {} })
      const newRestrictions = { 3: { d1: 5, d2: 15 }, 9: { d1: 5, d2: 15 } }
      const s = reducer(
        { ...initial, data: [v] },
        actions.successRequestUpdateRestrictions({ id: 'v1', restrictions: newRestrictions }),
      )
      expect(s.data[0].restrictions).toEqual(newRestrictions)
    })

    it('successRequestUpdateRestrictions does not affect other vehicles', () => {
      const v1 = makeVehicle({ id: 'v1', restrictions: {} })
      const v2 = makeVehicle({ id: 'v2', plate: 'XYZ999', restrictions: { 1: { d1: 2, d2: 12 } } })
      const s = reducer(
        { ...initial, data: [v1, v2] },
        actions.successRequestUpdateRestrictions({ id: 'v1', restrictions: { 5: { d1: 1, d2: 11 } } }),
      )
      expect(s.data.find((v) => v.id === 'v2').restrictions).toEqual({ 1: { d1: 2, d2: 12 } })
    })

    it('errorRequestUpdateRestrictions sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdateRestrictions('forbidden'))
      expect(s.isError).toBe(true)
    })
  })
})
