import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/eggReducer'
import * as actions from '../../actions/cashflow/eggActions'
import { makeEgg } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, saving: false, isError: false }

describe('eggReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginRequestFetch sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data', () => {
      const eggs = [makeEgg()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(eggs))
      expect(s.data).toEqual(eggs)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError and stores error', () => {
      const s = reducer(initial, actions.errorRequestFetch('fetch failed'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('fetch failed')
    })
  })

  describe('create', () => {
    it('beginRequestCreate sets saving', () => {
      expect(reducer(initial, actions.beginRequestCreate()).saving).toBe(true)
    })

    it('successRequestCreate prepends to existing data', () => {
      const e1 = makeEgg({ id: 'egg-1' })
      const e2 = makeEgg({ id: 'egg-2', amount: 300000 })
      const s = reducer(
        { ...initial, data: [e1], saving: true },
        actions.successRequestCreate(e2),
      )
      expect(s.data[0].id).toBe('egg-2')
      expect(s.data[1].id).toBe('egg-1')
      expect(s.saving).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const e = makeEgg()
      const s = reducer(initial, actions.successRequestCreate(e))
      expect(s.data).toEqual([e])
    })

    it('errorRequestCreate sets isError', () => {
      const s = reducer(initial, actions.errorRequestCreate('create error'))
      expect(s.isError).toBe(true)
      expect(s.saving).toBe(false)
    })
  })

  describe('update', () => {
    it('updateRequest sets saving', () => {
      expect(reducer(initial, actions.updateRequest()).saving).toBe(true)
    })

    it('successRequestUpdate merges fields by id', () => {
      const e = makeEgg({ id: 'egg-1', amount: 500000 })
      const s = reducer(
        { ...initial, data: [e], saving: true },
        actions.successRequestUpdate({ id: 'egg-1', amount: 700000 }),
      )
      expect(s.data[0].amount).toBe(700000)
      expect(s.saving).toBe(false)
    })

    it('successRequestUpdate does nothing when data is null', () => {
      const s = reducer(initial, actions.successRequestUpdate({ id: 'egg-1', amount: 700000 }))
      expect(s.data).toBeNull()
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('update error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('beginRequestDelete sets saving', () => {
      expect(reducer(initial, actions.beginRequestDelete()).saving).toBe(true)
    })

    it('successRequestDelete removes egg by id', () => {
      const e1 = makeEgg({ id: 'egg-1' })
      const e2 = makeEgg({ id: 'egg-2', amount: 200000 })
      const s = reducer(
        { ...initial, data: [e1, e2], saving: true },
        actions.successRequestDelete({ id: 'egg-1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('egg-2')
      expect(s.saving).toBe(false)
    })

    it('successRequestDelete does nothing when data is null', () => {
      const s = reducer(initial, actions.successRequestDelete({ id: 'egg-1' }))
      expect(s.data).toBeNull()
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('delete error'))
      expect(s.isError).toBe(true)
    })
  })
})
