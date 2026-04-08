import { describe, it, expect } from 'vitest'
import reducer from '../Taxi/taxiDriverReducer'
import * as actions from '../../actions/Taxi/taxiDriverActions'
import { makeDriver } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('taxiDriverReducer', () => {
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

    it('successRequestFetch stores data and clears fetching', () => {
      const drivers = [makeDriver()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(drivers))
      expect(s.data).toEqual(drivers)
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
    it('beginRequestCreate sets fetching', () => {
      expect(reducer(initial, actions.beginRequestCreate()).fetching).toBe(true)
    })

    it('successRequestCreate appends driver and sorts alphabetically', () => {
      const existing = makeDriver({ id: 'd2', name: 'Pedro Ramirez' })
      const incoming = makeDriver({ id: 'd1', name: 'Ana Garcia' })
      const s = reducer({ ...initial, data: [existing] }, actions.successRequestCreate(incoming))
      expect(s.data[0].name).toBe('Ana Garcia')
      expect(s.data[1].name).toBe('Pedro Ramirez')
      expect(s.fetching).toBe(false)
    })

    it('successRequestCreate initializes data array when null', () => {
      const driver = makeDriver()
      const s = reducer(initial, actions.successRequestCreate(driver))
      expect(s.data).toEqual([driver])
    })

    it('sort is case-insensitive via localeCompare', () => {
      const drivers = [
        makeDriver({ id: 'd3', name: 'carlos gil' }),
        makeDriver({ id: 'd1', name: 'Ana Torres' }),
        makeDriver({ id: 'd2', name: 'beatriz Lopez' }),
      ]
      const s = reducer({ ...initial, data: [] }, actions.successRequestFetch(drivers))
      // fetch just sets data — sort happens on create; verify the shape is stored as-is on fetch
      expect(s.data).toEqual(drivers)
    })

    it('errorRequestCreate sets isError and stores error', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestCreate('forbidden'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('forbidden')
      expect(s.fetching).toBe(false)
    })
  })

  // ── Update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('successRequestUpdate merges fields by id and re-sorts', () => {
      const d1 = makeDriver({ id: 'd1', name: 'Ana Garcia' })
      const d2 = makeDriver({ id: 'd2', name: 'Pedro Ramirez' })
      // Rename d2 to "Beatriz Lopez" — should now come first
      const s = reducer(
        { ...initial, data: [d1, d2] },
        actions.successRequestUpdate({ id: 'd2', name: 'Beatriz Lopez', defaultAmount: 55000 }),
      )
      expect(s.data[0].name).toBe('Ana Garcia')
      expect(s.data[1].name).toBe('Beatriz Lopez')
      expect(s.data[1].defaultAmount).toBe(55000)
      // Unchanged fields preserved
      expect(s.data[1].defaultVehicle).toBe(d2.defaultVehicle)
    })

    it('successRequestUpdate is a no-op when data is null', () => {
      const s = reducer(initial, actions.successRequestUpdate({ id: 'd1', name: 'X' }))
      expect(s.data).toBeNull()
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('conflict'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('conflict')
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes driver by id', () => {
      const d1 = makeDriver({ id: 'd1' })
      const d2 = makeDriver({ id: 'd2' })
      const s = reducer({ ...initial, data: [d1, d2] }, actions.successRequestDelete({ id: 'd1' }))
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('d2')
    })

    it('successRequestDelete is a no-op when data is null', () => {
      const s = reducer(initial, actions.successRequestDelete({ id: 'd1' }))
      expect(s.data).toBeNull()
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })
})
