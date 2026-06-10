import { describe, it, expect } from 'vitest'
import reducer from '../system/appSettingsReducer'
import * as actions from '../../actions/system/appSettingsActions'

const initial = {
  data: null,
  error: {},
  fetching: false,
  isError: false,
  saveSeq: 0,
  lastSavedKey: null,
  saveError: null,
}

describe('appSettingsReducer', () => {
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
      const settings = [{ key: 'egg_current_price', value: '500' }]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(settings))
      expect(s.data).toEqual(settings)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError, stores error, clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('timeout'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('timeout')
      expect(s.fetching).toBe(false)
    })
  })

  describe('update', () => {
    it('updateRequest clears saveError', () => {
      const s = reducer({ ...initial, saveError: 'boom' }, actions.updateRequest({ key: 'k' }))
      expect(s.saveError).toBeNull()
    })

    it('successRequestUpdate updates the setting by key and bumps saveSeq', () => {
      const data = [
        { key: 'egg_current_price', value: '500' },
        { key: 'other', value: 'x' },
      ]
      const s = reducer(
        { ...initial, data },
        actions.successRequestUpdate({ key: 'egg_current_price', value: '600' }),
      )
      expect(s.data[0].value).toBe('600')
      expect(s.data[1].value).toBe('x')
      expect(s.saveSeq).toBe(1)
      expect(s.lastSavedKey).toBe('egg_current_price')
    })

    it('successRequestUpdate is a no-op on data when null', () => {
      const s = reducer(initial, actions.successRequestUpdate({ key: 'k', value: 'v' }))
      expect(s.data).toBeNull()
      expect(s.saveSeq).toBe(1)
    })

    it('errorRequestUpdate stores saveError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('denied'))
      expect(s.saveError).toBe('denied')
    })
  })
})
