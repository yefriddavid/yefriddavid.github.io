import { describe, it, expect } from 'vitest'
import reducer from '../taxi/vehicleLocationHistoryReducer'
import * as actions from '../../actions/taxi/vehicleLocationHistoryActions'

const initial = {
  data: null,
  error: {},
  fetching: false,
  isError: false,
  recentHistories: {},
  loadingHistories: {},
}

const makeHistory = (overrides = {}) => ({
  id: 'hist-1',
  vehicleId: 'v1',
  lat: 4.7,
  lng: -74.0,
  timestamp: '2024-03-10T10:00:00Z',
  ...overrides,
})

describe('vehicleLocationHistoryReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores data', () => {
      const data = [makeHistory()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(data))
      expect(s.data).toEqual(data)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('err'))
      expect(s.fetching).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('create', () => {
    it('successRequestCreate appends history', () => {
      const h = makeHistory()
      const s = reducer(initial, actions.successRequestCreate(h))
      expect(s.data).toEqual([h])
    })
  })

  describe('delete', () => {
    it('successRequestDelete removes history by id', () => {
      const h1 = makeHistory({ id: 'hist-1' })
      const h2 = makeHistory({ id: 'hist-2', lat: 5.0 })
      const s = reducer(
        { ...initial, data: [h1, h2] },
        actions.successRequestDelete({ id: 'hist-1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('hist-2')
    })

    it('successRequestDelete also removes entry from recentHistories', () => {
      const h1 = makeHistory({ id: 'hist-1', vehicleId: 'v1' })
      const h2 = makeHistory({ id: 'hist-2', vehicleId: 'v1', lat: 5.0 })
      const state = {
        ...initial,
        data: [h1, h2],
        recentHistories: { v1: [h1, h2] },
      }
      const s = reducer(state, actions.successRequestDelete({ id: 'hist-1', vehicleId: 'v1' }))
      expect(s.recentHistories.v1).toHaveLength(1)
      expect(s.recentHistories.v1[0].id).toBe('hist-2')
    })

    it('successRequestDelete without vehicleId leaves recentHistories intact', () => {
      const h = makeHistory({ id: 'hist-1', vehicleId: 'v1' })
      const state = {
        ...initial,
        data: [h],
        recentHistories: { v1: [h] },
      }
      const s = reducer(state, actions.successRequestDelete({ id: 'hist-1' }))
      expect(s.recentHistories.v1).toHaveLength(1)
    })
  })

  describe('recent histories', () => {
    it('fetchRecentRequest marks vehicleId as loading', () => {
      const s = reducer(initial, actions.fetchRecentRequest({ vehicleId: 'v1', plate: 'ABC123' }))
      expect(s.loadingHistories.v1).toBe(true)
    })

    it('fetchRecentSuccess stores data and clears loading', () => {
      const data = [makeHistory(), makeHistory({ id: 'hist-2' })]
      const state = { ...initial, loadingHistories: { v1: true } }
      const s = reducer(state, actions.fetchRecentSuccess({ vehicleId: 'v1', data }))
      expect(s.recentHistories.v1).toEqual(data)
      expect(s.loadingHistories.v1).toBe(false)
    })

    it('fetchRecentError clears loading', () => {
      const state = { ...initial, loadingHistories: { v1: true } }
      const s = reducer(state, actions.fetchRecentError({ vehicleId: 'v1' }))
      expect(s.loadingHistories.v1).toBe(false)
    })
  })
})
