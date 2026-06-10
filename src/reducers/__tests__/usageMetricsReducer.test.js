import { describe, it, expect } from 'vitest'
import reducer from '../system/usageMetricsReducer'
import * as actions from '../../actions/system/usageMetricsActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('usageMetricsReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('fetchRequest sets fetching and clears isError', () => {
    const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
    expect(s.fetching).toBe(true)
    expect(s.isError).toBe(false)
  })

  it('successRequestFetch stores data and clears fetching', () => {
    const counts = [{ name: 'users', label: 'Usuarios', count: 12 }]
    const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(counts))
    expect(s.data).toEqual(counts)
    expect(s.fetching).toBe(false)
  })

  it('errorRequestFetch sets isError and stores error', () => {
    const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('quota'))
    expect(s.isError).toBe(true)
    expect(s.error).toBe('quota')
    expect(s.fetching).toBe(false)
  })
})
