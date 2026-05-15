import { describe, it, expect, vi } from 'vitest'
import reducer from '../finance/customGridTradeReducer'
import * as actions from '../../actions/finance/customGridTradeActions'
import { makeCustomGridTrade } from '../../__tests__/factories'

const initial = { trades: [], loading: false, saving: false, error: null, useIndexedDB: false }

describe('customGridTradeReducer', () => {
  it('returns state with known shape', () => {
    const s = reducer(undefined, { type: '@@INIT' })
    expect(s.trades).toEqual([])
    expect(s.loading).toBe(false)
    expect(s.saving).toBe(false)
    expect(s.error).toBeNull()
    expect(typeof s.useIndexedDB).toBe('boolean')
  })

  describe('load', () => {
    it('loadRequest sets loading', () => {
      expect(reducer(initial, actions.loadRequest()).loading).toBe(true)
    })

    it('loadSuccess stores trades', () => {
      const trades = [makeCustomGridTrade()]
      const s = reducer({ ...initial, loading: true }, actions.loadSuccess(trades))
      expect(s.trades).toEqual(trades)
      expect(s.loading).toBe(false)
    })

    it('loadError stores error', () => {
      const s = reducer({ ...initial, loading: true }, actions.loadError('network error'))
      expect(s.error).toBe('network error')
      expect(s.loading).toBe(false)
    })
  })

  describe('save (upsert)', () => {
    it('saveRequest sets saving', () => {
      expect(reducer(initial, actions.saveRequest()).saving).toBe(true)
    })

    it('saveSuccess inserts new trade', () => {
      const t = makeCustomGridTrade()
      const s = reducer({ ...initial, saving: true }, actions.saveSuccess(t))
      expect(s.trades).toEqual([t])
      expect(s.saving).toBe(false)
    })

    it('saveSuccess updates existing trade by id', () => {
      const t1 = makeCustomGridTrade({ id: 'cgt-1', grids: 5 })
      const t2 = makeCustomGridTrade({ id: 'cgt-2', grids: 8 })
      const s = reducer(
        { ...initial, trades: [t1, t2] },
        actions.saveSuccess({ id: 'cgt-1', grids: 15 }),
      )
      expect(s.trades[0].grids).toBe(15)
      expect(s.trades[1].id).toBe('cgt-2')
    })

    it('saveError stores error', () => {
      const s = reducer(initial, actions.saveError('save error'))
      expect(s.error).toBe('save error')
      expect(s.saving).toBe(false)
    })
  })

  describe('delete', () => {
    it('deleteRequest sets saving', () => {
      expect(reducer(initial, actions.deleteRequest()).saving).toBe(true)
    })

    it('deleteSuccess removes trade by id', () => {
      const t1 = makeCustomGridTrade({ id: 'cgt-1' })
      const t2 = makeCustomGridTrade({ id: 'cgt-2', symbol: 'SOLUSDT' })
      const s = reducer(
        { ...initial, trades: [t1, t2], saving: true },
        actions.deleteSuccess({ id: 'cgt-1' }),
      )
      expect(s.trades).toHaveLength(1)
      expect(s.trades[0].id).toBe('cgt-2')
    })

    it('deleteError stores error', () => {
      const s = reducer(initial, actions.deleteError('delete error'))
      expect(s.error).toBe('delete error')
    })
  })

  describe('setStorage', () => {
    it('setStorage true sets useIndexedDB to true', () => {
      const s = reducer(initial, actions.setStorage(true))
      expect(s.useIndexedDB).toBe(true)
    })

    it('setStorage false sets useIndexedDB to false', () => {
      const s = reducer({ ...initial, useIndexedDB: true }, actions.setStorage(false))
      expect(s.useIndexedDB).toBe(false)
    })

    it('setStorage writes to localStorage', () => {
      const spy = vi.spyOn(localStorage, 'setItem')
      reducer(initial, actions.setStorage(true))
      expect(spy).toHaveBeenCalledWith('customGridTrade.storage', 'indexeddb')
      spy.mockRestore()
    })
  })

  describe('bulkImport', () => {
    it('bulkImportRequest sets saving', () => {
      expect(reducer(initial, actions.bulkImportRequest()).saving).toBe(true)
    })

    it('bulkImportSuccess replaces trades', () => {
      const imported = [makeCustomGridTrade({ id: 'new' })]
      const s = reducer(
        { ...initial, trades: [makeCustomGridTrade({ id: 'old' })], saving: true },
        actions.bulkImportSuccess(imported),
      )
      expect(s.trades).toEqual(imported)
      expect(s.saving).toBe(false)
    })

    it('bulkImportError stores error', () => {
      const s = reducer(initial, actions.bulkImportError('bulk error'))
      expect(s.error).toBe('bulk error')
    })
  })

  describe('sync', () => {
    it('syncRequest sets saving', () => {
      expect(reducer(initial, actions.syncRequest()).saving).toBe(true)
    })

    it('syncSuccess clears saving', () => {
      expect(reducer({ ...initial, saving: true }, actions.syncSuccess()).saving).toBe(false)
    })

    it('syncError stores error', () => {
      const s = reducer(initial, actions.syncError('sync error'))
      expect(s.error).toBe('sync error')
    })
  })

  describe('deleteAll', () => {
    it('deleteAllRequest sets saving', () => {
      expect(reducer(initial, actions.deleteAllRequest()).saving).toBe(true)
    })

    it('deleteAllSuccess empties trades', () => {
      const s = reducer(
        { ...initial, trades: [makeCustomGridTrade()], saving: true },
        actions.deleteAllSuccess(),
      )
      expect(s.trades).toEqual([])
      expect(s.saving).toBe(false)
    })

    it('deleteAllError stores error', () => {
      const s = reducer(initial, actions.deleteAllError('all delete error'))
      expect(s.error).toBe('all delete error')
    })
  })
})
