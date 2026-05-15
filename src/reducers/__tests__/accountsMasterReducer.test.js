import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/accountsMasterReducer'
import * as actions from '../../actions/cashflow/accountsMasterActions'
import { makeAccountMaster } from '../../__tests__/factories'

const initial = {
  data: null,
  error: {},
  fetching: false,
  isError: false,
  saving: false,
  seeding: false,
  seedProgress: 0,
  patching: false,
  patchProgress: 0,
}

describe('accountsMasterReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores data', () => {
      const data = [makeAccountMaster()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(data))
      expect(s.data).toEqual(data)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer(initial, actions.errorRequestFetch('network error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('network error')
    })
  })

  describe('create', () => {
    it('successRequestCreate appends account', () => {
      const a = makeAccountMaster()
      const s = reducer(initial, actions.successRequestCreate(a))
      expect(s.data).toEqual([a])
      expect(s.saving).toBe(false)
    })
  })

  describe('update', () => {
    it('beginRequestUpdate sets saving', () => {
      const s = reducer(initial, actions.beginRequestUpdate())
      expect(s.saving).toBe(true)
    })

    it('successRequestUpdate merges fields by id', () => {
      const a1 = makeAccountMaster({ id: 'am-1', name: 'Old Name' })
      const a2 = makeAccountMaster({ id: 'am-2', name: 'Other' })
      const s = reducer(
        { ...initial, data: [a1, a2], saving: true },
        actions.successRequestUpdate({ id: 'am-1', name: 'New Name' }),
      )
      expect(s.data.find((a) => a.id === 'am-1').name).toBe('New Name')
      expect(s.data.find((a) => a.id === 'am-2').name).toBe('Other')
      expect(s.saving).toBe(false)
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate('write error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('successRequestDelete removes account by id', () => {
      const a1 = makeAccountMaster({ id: 'am-1' })
      const a2 = makeAccountMaster({ id: 'am-2', name: 'Keep' })
      const s = reducer(
        { ...initial, data: [a1, a2] },
        actions.successRequestDelete({ id: 'am-1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('am-2')
    })
  })

  describe('seed', () => {
    it('seedRequest sets seeding and resets progress', () => {
      const s = reducer({ ...initial, seedProgress: 50 }, actions.seedRequest())
      expect(s.seeding).toBe(true)
      expect(s.seedProgress).toBe(0)
    })

    it('seedProgressUpdate updates seedProgress', () => {
      const s = reducer({ ...initial, seeding: true }, actions.seedProgressUpdate(60))
      expect(s.seedProgress).toBe(60)
    })

    it('seedComplete clears seeding and sets progress to 100', () => {
      const s = reducer({ ...initial, seeding: true, seedProgress: 60 }, actions.seedComplete())
      expect(s.seeding).toBe(false)
      expect(s.seedProgress).toBe(100)
    })

    it('seedError sets isError', () => {
      const s = reducer({ ...initial, seeding: true }, actions.seedError('seed failed'))
      expect(s.seeding).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('patch', () => {
    it('patchManyRequest sets patching and resets progress', () => {
      const s = reducer({ ...initial, patchProgress: 80 }, actions.patchManyRequest())
      expect(s.patching).toBe(true)
      expect(s.patchProgress).toBe(0)
    })

    it('patchManyProgress updates patchProgress', () => {
      const s = reducer({ ...initial, patching: true }, actions.patchManyProgress(40))
      expect(s.patchProgress).toBe(40)
    })

    it('patchManyComplete clears patching and sets progress to 100', () => {
      const s = reducer({ ...initial, patching: true, patchProgress: 80 }, actions.patchManyComplete())
      expect(s.patching).toBe(false)
      expect(s.patchProgress).toBe(100)
    })

    it('patchManyError sets isError', () => {
      const s = reducer({ ...initial, patching: true }, actions.patchManyError('patch failed'))
      expect(s.patching).toBe(false)
      expect(s.isError).toBe(true)
    })
  })
})
