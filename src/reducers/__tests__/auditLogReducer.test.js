import { describe, it, expect } from 'vitest'
import reducer from '../system/auditLogReducer'
import * as actions from '../../actions/system/auditLogActions'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('auditLogReducer', () => {
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
      const logs = [{ id: 'a1', action: 'login' }]
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

  describe('delete', () => {
    it('beginRequestDelete sets fetching', () => {
      expect(reducer(initial, actions.beginRequestDelete()).fetching).toBe(true)
    })

    it('successRequestDelete removes the record by id and clears fetching', () => {
      const data = [{ id: 'a1' }, { id: 'a2' }]
      const s = reducer(
        { ...initial, data, fetching: true },
        actions.successRequestDelete({ id: 'a1' }),
      )
      expect(s.data).toEqual([{ id: 'a2' }])
      expect(s.fetching).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('not found'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('not found')
    })
  })
})
