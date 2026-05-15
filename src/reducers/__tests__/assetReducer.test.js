import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/assetReducer'
import * as actions from '../../actions/cashflow/assetActions'
import { makeAsset } from '../../__tests__/factories'

const initial = {
  assets: [],
  loading: false,
  saving: false,
  syncing: false,
  syncingAll: false,
  importing: false,
  error: null,
}

describe('assetReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('load', () => {
    it('loadRequest sets loading', () => {
      expect(reducer(initial, actions.loadRequest()).loading).toBe(true)
    })

    it('loadSuccess stores assets', () => {
      const assets = [makeAsset()]
      const s = reducer({ ...initial, loading: true }, actions.loadSuccess(assets))
      expect(s.assets).toEqual(assets)
      expect(s.loading).toBe(false)
    })

    it('loadError stores error', () => {
      const s = reducer(initial, actions.loadError('load failed'))
      expect(s.error).toBe('load failed')
      expect(s.loading).toBe(false)
    })
  })

  describe('save (upsert)', () => {
    it('saveRequest sets saving', () => {
      expect(reducer(initial, actions.saveRequest()).saving).toBe(true)
    })

    it('saveSuccess inserts new asset', () => {
      const a = makeAsset()
      const s = reducer({ ...initial, saving: true }, actions.saveSuccess(a))
      expect(s.assets).toEqual([a])
      expect(s.saving).toBe(false)
    })

    it('saveSuccess updates existing asset by id', () => {
      const a1 = makeAsset({ id: 'asset-1', name: 'Old Name' })
      const a2 = makeAsset({ id: 'asset-2', name: 'Other' })
      const s = reducer(
        { ...initial, assets: [a1, a2] },
        actions.saveSuccess({ id: 'asset-1', name: 'New Name' }),
      )
      expect(s.assets[0].name).toBe('New Name')
      expect(s.assets[1].name).toBe('Other')
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

    it('deleteSuccess removes asset by id', () => {
      const a1 = makeAsset({ id: 'asset-1' })
      const a2 = makeAsset({ id: 'asset-2', name: 'Keep' })
      const s = reducer(
        { ...initial, assets: [a1, a2], saving: true },
        actions.deleteSuccess({ id: 'asset-1' }),
      )
      expect(s.assets).toHaveLength(1)
      expect(s.assets[0].id).toBe('asset-2')
      expect(s.saving).toBe(false)
    })

    it('deleteError stores error', () => {
      const s = reducer(initial, actions.deleteError('delete error'))
      expect(s.error).toBe('delete error')
    })
  })

  describe('sync', () => {
    it('syncRequest sets syncing', () => {
      expect(reducer(initial, actions.syncRequest()).syncing).toBe(true)
    })

    it('syncSuccess updates asset in place', () => {
      const a = makeAsset({ id: 'asset-1', syncedAt: null })
      const updated = { ...a, syncedAt: '2024-03-10T10:00:00Z' }
      const s = reducer(
        { ...initial, assets: [a], syncing: true },
        actions.syncSuccess(updated),
      )
      expect(s.assets[0].syncedAt).toBe('2024-03-10T10:00:00Z')
      expect(s.syncing).toBe(false)
    })

    it('syncError stores error', () => {
      const s = reducer(initial, actions.syncError('sync error'))
      expect(s.error).toBe('sync error')
      expect(s.syncing).toBe(false)
    })
  })

  describe('syncAll', () => {
    it('syncAllRequest sets syncingAll', () => {
      expect(reducer(initial, actions.syncAllRequest()).syncingAll).toBe(true)
    })

    it('syncAllSuccess updates syncedAt for each asset', () => {
      const a1 = makeAsset({ id: 'asset-1', syncedAt: null })
      const a2 = makeAsset({ id: 'asset-2', syncedAt: null })
      const s = reducer(
        { ...initial, assets: [a1, a2], syncingAll: true },
        actions.syncAllSuccess([
          { id: 'asset-1', syncedAt: '2024-03-10T10:00:00Z' },
          { id: 'asset-2', syncedAt: '2024-03-10T10:01:00Z' },
        ]),
      )
      expect(s.assets[0].syncedAt).toBe('2024-03-10T10:00:00Z')
      expect(s.assets[1].syncedAt).toBe('2024-03-10T10:01:00Z')
      expect(s.syncingAll).toBe(false)
    })

    it('syncAllError stores error', () => {
      const s = reducer(initial, actions.syncAllError('sync all error'))
      expect(s.error).toBe('sync all error')
      expect(s.syncingAll).toBe(false)
    })
  })

  describe('import', () => {
    it('importRequest sets importing', () => {
      expect(reducer(initial, actions.importRequest()).importing).toBe(true)
    })

    it('importSuccess replaces assets', () => {
      const imported = [makeAsset({ id: 'asset-new' })]
      const s = reducer(
        { ...initial, assets: [makeAsset({ id: 'asset-old' })], importing: true },
        actions.importSuccess(imported),
      )
      expect(s.assets).toEqual(imported)
      expect(s.importing).toBe(false)
    })

    it('importError stores error', () => {
      const s = reducer(initial, actions.importError('import error'))
      expect(s.error).toBe('import error')
      expect(s.importing).toBe(false)
    })
  })
})
