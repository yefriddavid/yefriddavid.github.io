import { describe, it, expect } from 'vitest'
import reducer from '../system/pageVisitReducer'
import * as actions from '../../actions/system/pageVisitActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('pageVisitReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores data and clears fetching', () => {
      const visits = [{ id: 'v1', page: 'about-me' }]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(visits))
      expect(s.data).toEqual(visits)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError and stores error', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('timeout')
      expect(s.fetching).toBe(false)
    })
  })

  describe('delete', () => {
    it('beginRequestDelete sets fetching', () => {
      expect(reducer(initial, actions.beginRequestDelete()).fetching).toBe(true)
    })

    it('successRequestDelete removes the visit by id and clears fetching', () => {
      const data = [{ id: 'v1' }, { id: 'v2' }]
      const s = reducer(
        { ...initial, data, fetching: true },
        actions.successRequestDelete({ id: 'v1' }),
      )
      expect(s.data).toEqual([{ id: 'v2' }])
      expect(s.fetching).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
    })
  })

  it('trackVisitRequest does not mutate state', () => {
    const s = reducer(initial, actions.trackVisitRequest('about-me'))
    expect(s).toEqual(initial)
  })
})
