import { describe, it, expect } from 'vitest'
import reducer from '../taxi/currentPositionsReducer'
import * as actions from '../../actions/taxi/currentPositionsActions'

describe('currentPositionsReducer', () => {
  it('returns empty object as initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({})
  })

  describe('updateFromWss', () => {
    it('adds a new wss position', () => {
      const s = reducer(
        {},
        actions.updateFromWss({ vehicleId: 'v1', lat: 4.7, lng: -74.0, speed: 40, lastUpdate: '2024-03-10T10:00:00Z' }),
      )
      expect(s.v1).toEqual({ lat: 4.7, lng: -74.0, speed: 40, lastUpdate: '2024-03-10T10:00:00Z', source: 'wss' })
    })

    it('overwrites an existing app position with wss', () => {
      const existing = { v1: { lat: 1, lng: 1, speed: 0, lastUpdate: '2024-01-01T00:00:00Z', source: 'app' } }
      const s = reducer(
        existing,
        actions.updateFromWss({ vehicleId: 'v1', lat: 4.7, lng: -74.0, speed: 60, lastUpdate: '2024-03-10T10:00:00Z' }),
      )
      expect(s.v1.source).toBe('wss')
      expect(s.v1.speed).toBe(60)
    })
  })

  describe('updateFromApp', () => {
    it('adds a position when vehicle has no existing entry', () => {
      const s = reducer(
        {},
        actions.updateFromApp({ vehicleId: 'v1', lat: 4.7, lng: -74.0, lastUpdate: '2024-03-10T10:00:00Z' }),
      )
      expect(s.v1).toEqual({ lat: 4.7, lng: -74.0, speed: 0, lastUpdate: '2024-03-10T10:00:00Z', source: 'app' })
    })

    it('does not overwrite a wss position', () => {
      const existing = { v1: { lat: 9, lng: 9, speed: 80, lastUpdate: '2024-03-10T11:00:00Z', source: 'wss' } }
      const s = reducer(
        existing,
        actions.updateFromApp({ vehicleId: 'v1', lat: 4.7, lng: -74.0, lastUpdate: '2024-03-10T12:00:00Z' }),
      )
      expect(s.v1.source).toBe('wss')
      expect(s.v1.lat).toBe(9)
    })

    it('updates an app position when incoming lastUpdate is newer', () => {
      const existing = { v1: { lat: 1, lng: 1, speed: 0, lastUpdate: '2024-03-10T08:00:00Z', source: 'app' } }
      const s = reducer(
        existing,
        actions.updateFromApp({ vehicleId: 'v1', lat: 4.7, lng: -74.0, lastUpdate: '2024-03-10T10:00:00Z' }),
      )
      expect(s.v1.lat).toBe(4.7)
      expect(s.v1.lastUpdate).toBe('2024-03-10T10:00:00Z')
    })

    it('does not update an app position when incoming lastUpdate is older', () => {
      const existing = { v1: { lat: 5, lng: 5, speed: 0, lastUpdate: '2024-03-10T12:00:00Z', source: 'app' } }
      const s = reducer(
        existing,
        actions.updateFromApp({ vehicleId: 'v1', lat: 4.7, lng: -74.0, lastUpdate: '2024-03-10T10:00:00Z' }),
      )
      expect(s.v1.lat).toBe(5)
    })
  })

  describe('resetAll', () => {
    it('clears all positions', () => {
      const populated = {
        v1: { lat: 4.7, lng: -74.0, speed: 0, lastUpdate: '2024-03-10T10:00:00Z', source: 'app' },
        v2: { lat: 4.8, lng: -74.1, speed: 20, lastUpdate: '2024-03-10T10:00:00Z', source: 'wss' },
      }
      expect(reducer(populated, actions.resetAll())).toEqual({})
    })
  })
})
