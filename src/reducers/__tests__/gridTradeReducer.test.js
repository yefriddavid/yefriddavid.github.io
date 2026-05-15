import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/gridTradeReducer'
import * as actions from '../../actions/cashflow/gridTradeActions'
import { makeGridTrade } from '../../__tests__/factories'

const initial = { trades: [], loading: false, saving: false, error: null }

describe('gridTradeReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('load', () => {
    it('loadRequest sets loading', () => {
      expect(reducer(initial, actions.loadRequest()).loading).toBe(true)
    })

    it('loadSuccess stores trades', () => {
      const trades = [makeGridTrade()]
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
      const t = makeGridTrade()
      const s = reducer({ ...initial, saving: true }, actions.saveSuccess(t))
      expect(s.trades).toEqual([t])
      expect(s.saving).toBe(false)
    })

    it('saveSuccess updates existing trade in place', () => {
      const t1 = makeGridTrade({ id: 'gt-1', grids: 10 })
      const t2 = makeGridTrade({ id: 'gt-2', grids: 5 })
      const s = reducer(
        { ...initial, trades: [t1, t2], saving: true },
        actions.saveSuccess({ id: 'gt-1', grids: 20 }),
      )
      expect(s.trades[0].grids).toBe(20)
      expect(s.trades[1].id).toBe('gt-2')
      expect(s.saving).toBe(false)
    })

    it('saveError stores error', () => {
      const s = reducer(initial, actions.saveError('save failed'))
      expect(s.error).toBe('save failed')
      expect(s.saving).toBe(false)
    })
  })

  describe('delete', () => {
    it('deleteRequest sets saving', () => {
      expect(reducer(initial, actions.deleteRequest()).saving).toBe(true)
    })

    it('deleteSuccess removes trade by id', () => {
      const t1 = makeGridTrade({ id: 'gt-1' })
      const t2 = makeGridTrade({ id: 'gt-2', symbol: 'ETHUSDT' })
      const s = reducer(
        { ...initial, trades: [t1, t2], saving: true },
        actions.deleteSuccess({ id: 'gt-1' }),
      )
      expect(s.trades).toHaveLength(1)
      expect(s.trades[0].id).toBe('gt-2')
      expect(s.saving).toBe(false)
    })

    it('deleteError stores error', () => {
      const s = reducer(initial, actions.deleteError('delete failed'))
      expect(s.error).toBe('delete failed')
    })
  })
})
