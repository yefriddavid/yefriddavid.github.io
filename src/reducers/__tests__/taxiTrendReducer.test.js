import { describe, it, expect } from 'vitest'
import reducer from '../taxi/taxiTrendReducer'
import * as actions from '../../actions/taxi/taxiTrendActions'

const initial = { settlements: null, expenses: null, periodKey: null, fetching: false }

describe('taxiTrendReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  it('fetchRequest and beginRequestFetch set fetching', () => {
    expect(reducer(initial, actions.fetchRequest()).fetching).toBe(true)
    expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
  })

  it('successRequestFetch stores settlements, expenses and periodKey', () => {
    const payload = {
      settlements: [{ id: 's1', amount: 100 }],
      expenses: [{ id: 'e1', amount: 40 }],
      periodKey: '2026-6',
    }
    const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(payload))
    expect(s.settlements).toEqual(payload.settlements)
    expect(s.expenses).toEqual(payload.expenses)
    expect(s.periodKey).toBe('2026-6')
    expect(s.fetching).toBe(false)
  })

  it('errorRequestFetch clears fetching', () => {
    const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
    expect(s.fetching).toBe(false)
  })

  it('clearRequest resets the slice', () => {
    const loaded = {
      settlements: [{ id: 's1' }],
      expenses: [{ id: 'e1' }],
      periodKey: '2026-6',
      fetching: true,
    }
    expect(reducer(loaded, actions.clearRequest())).toEqual(initial)
  })
})
