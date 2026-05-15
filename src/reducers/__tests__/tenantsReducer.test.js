import { describe, it, expect } from 'vitest'
import reducer from '../tenantsReducer'
import * as actions from '../../actions/tenantsActions'
import { makeTenant } from '../../__tests__/factories'

const initial = { data: null, error: {}, fetching: false, isError: false }

describe('tenantsReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores tenants', () => {
      const tenants = [makeTenant()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(tenants))
      expect(s.data).toEqual(tenants)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer(initial, actions.errorRequestFetch('network error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('network error')
    })
  })

  describe('create', () => {
    it('successRequestCreate appends and sorts by name', () => {
      const t1 = makeTenant({ id: 't1', name: 'Zara' })
      const t2 = makeTenant({ id: 't2', name: 'Ana' })
      const s = reducer({ ...initial, data: [t1] }, actions.successRequestCreate(t2))
      expect(s.data[0].name).toBe('Ana')
      expect(s.data[1].name).toBe('Zara')
    })

    it('successRequestCreate initializes data when null', () => {
      const t = makeTenant()
      expect(reducer(initial, actions.successRequestCreate(t)).data).toEqual([t])
    })
  })

  describe('update', () => {
    it('successRequestUpdate merges fields by id and re-sorts by name', () => {
      const t1 = makeTenant({ id: 't1', name: 'Ana' })
      const t2 = makeTenant({ id: 't2', name: 'Zara' })
      const s = reducer(
        { ...initial, data: [t1, t2] },
        actions.successRequestUpdate({ id: 't2', name: 'Abel' }),
      )
      expect(s.data[0].name).toBe('Abel')
      expect(s.data[1].name).toBe('Ana')
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('write error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('successRequestDelete removes tenant by id', () => {
      const t1 = makeTenant({ id: 't1' })
      const t2 = makeTenant({ id: 't2', name: 'Keep' })
      const s = reducer(
        { ...initial, data: [t1, t2] },
        actions.successRequestDelete({ id: 't1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('t2')
    })
  })
})
