import { describe, it, expect } from 'vitest'
import reducer from '../system/fcmTokenReducer'
import * as actions from '../../actions/system/fcmTokenActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('fcmTokenReducer', () => {
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
      const tokens = [{ id: 't1', token: 'abc' }]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(tokens))
      expect(s.data).toEqual(tokens)
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

    it('successRequestDelete removes the token by id and clears fetching', () => {
      const data = [{ id: 't1' }, { id: 't2' }]
      const s = reducer(
        { ...initial, data, fetching: true },
        actions.successRequestDelete({ id: 't2' }),
      )
      expect(s.data).toEqual([{ id: 't1' }])
      expect(s.fetching).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('not found')
    })
  })
})
