import { describe, it, expect } from 'vitest'
import reducer from '../taxi/vehicleRouteReducer'
import * as actions from '../../actions/taxi/vehicleRouteActions'

const initial = { data: [], fetching: false, error: null }

const makePoint = (overrides = {}) => ({
  lat: 4.7,
  lng: -74.0,
  timestamp: '2024-03-10T10:00:00Z',
  ...overrides,
})

describe('vehicleRouteReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching, clears data and error', () => {
      const s = reducer(
        { data: [makePoint()], fetching: false, error: 'prev error' },
        actions.fetchRequest(),
      )
      expect(s.fetching).toBe(true)
      expect(s.data).toEqual([])
      expect(s.error).toBeNull()
    })

    it('fetchSuccess stores route data', () => {
      const points = [makePoint(), makePoint({ lat: 4.8 })]
      const s = reducer({ ...initial, fetching: true }, actions.fetchSuccess(points))
      expect(s.data).toEqual(points)
      expect(s.fetching).toBe(false)
    })

    it('fetchError stores error and clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.fetchError('timeout'))
      expect(s.fetching).toBe(false)
      expect(s.error).toBe('timeout')
    })
  })

  describe('clearRoute', () => {
    it('clears data and error', () => {
      const s = reducer(
        { data: [makePoint()], fetching: false, error: 'some error' },
        actions.clearRoute(),
      )
      expect(s.data).toEqual([])
      expect(s.error).toBeNull()
    })

    it('does not affect fetching', () => {
      const s = reducer({ data: [], fetching: true, error: null }, actions.clearRoute())
      expect(s.fetching).toBe(true)
    })
  })
})
