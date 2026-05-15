import { describe, it, expect } from 'vitest'
import reducer from '../domoticaSolarBatteryReducer'
import * as actions from '../../../actions/domotica/domoticaSolarBatteryActions'

const initial = { battery: null, fetching: false, isError: false }

const makeBatteryData = (overrides = {}) => ({
  voltage: 12.5,
  percentage: 80,
  charging: true,
  timestamp: '2024-03-10T10:00:00Z',
  ...overrides,
})

describe('domoticaSolarBatteryReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('subscribeRequest sets fetching and clears isError', () => {
    const s = reducer({ ...initial, isError: true }, actions.subscribeRequest())
    expect(s.fetching).toBe(true)
    expect(s.isError).toBe(false)
  })

  it('dataReceived stores battery data and clears fetching and isError', () => {
    const data = makeBatteryData()
    const s = reducer({ ...initial, fetching: true, isError: true }, actions.dataReceived(data))
    expect(s.battery).toEqual(data)
    expect(s.fetching).toBe(false)
    expect(s.isError).toBe(false)
  })

  it('dataReceived updates battery on subsequent calls', () => {
    const first = makeBatteryData({ percentage: 80 })
    const second = makeBatteryData({ percentage: 75 })
    let s = reducer(initial, actions.dataReceived(first))
    s = reducer(s, actions.dataReceived(second))
    expect(s.battery.percentage).toBe(75)
  })

  it('fetchError sets isError and clears fetching', () => {
    const s = reducer({ ...initial, fetching: true }, actions.fetchError())
    expect(s.fetching).toBe(false)
    expect(s.isError).toBe(true)
  })

  it('unsubscribeRequest clears fetching', () => {
    const s = reducer({ ...initial, fetching: true }, actions.unsubscribeRequest())
    expect(s.fetching).toBe(false)
  })

  it('unsubscribeRequest does not clear battery data', () => {
    const data = makeBatteryData()
    const state = { battery: data, fetching: true, isError: false }
    const s = reducer(state, actions.unsubscribeRequest())
    expect(s.battery).toEqual(data)
  })
})
