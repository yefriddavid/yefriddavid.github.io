import { describe, it, expect } from 'vitest'
import reducer from '../system/perfLogReducer'
import * as actions from '../../actions/system/perfLogActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('perfLogReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('fetchRequest sets fetching and clears isError', () => {
    const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
    expect(s.fetching).toBe(true)
    expect(s.isError).toBe(false)
  })

  it('successRequestFetch stores data and clears fetching', () => {
    const logs = [{ id: 'p1', duration: 120 }]
    const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(logs))
    expect(s.data).toEqual(logs)
    expect(s.fetching).toBe(false)
  })

  it('errorRequestFetch sets isError and stores error', () => {
    const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
    expect(s.isError).toBe(true)
    expect(s.error).toBe('timeout')
    expect(s.fetching).toBe(false)
  })
})
