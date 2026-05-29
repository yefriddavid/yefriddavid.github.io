import { describe, it, expect } from 'vitest'
import reducer from '../finance/picturesReducer'
import * as actions from '../../actions/finance/picturesActions'
import { makePicture, makePictureNode } from '../../__tests__/factories'

const initial = {
  list: null,
  current: null,
  fetching: false,
  loading: false,
  saving: false,
  error: null,
}

describe('picturesReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('clearPicture', () => {
    it('clears current', () => {
      const s = reducer({ ...initial, current: makePicture() }, actions.clearPicture())
      expect(s.current).toBeNull()
    })
  })

  describe('fetch', () => {
    it('beginRequestFetch sets fetching and clears error', () => {
      const s = reducer({ ...initial, error: 'prev error' }, actions.beginRequestFetch())
      expect(s.fetching).toBe(true)
      expect(s.error).toBeNull()
    })

    it('successRequestFetch stores list and clears fetching', () => {
      const list = [makePicture({ id: 'a' }), makePicture({ id: 'b' })]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(list))
      expect(s.list).toEqual(list)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch stores error and clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('Network error'))
      expect(s.error).toBe('Network error')
      expect(s.fetching).toBe(false)
    })
  })

  describe('load', () => {
    it('beginRequestLoad sets loading', () => {
      expect(reducer(initial, actions.beginRequestLoad()).loading).toBe(true)
    })

    it('successRequestLoad stores current and clears loading', () => {
      const pic = makePicture()
      const s = reducer({ ...initial, loading: true }, actions.successRequestLoad(pic))
      expect(s.current).toEqual(pic)
      expect(s.loading).toBe(false)
    })

    it('errorRequestLoad stores error and clears loading', () => {
      const s = reducer({ ...initial, loading: true }, actions.errorRequestLoad('not found'))
      expect(s.error).toBe('not found')
      expect(s.loading).toBe(false)
    })
  })

  describe('create (save new)', () => {
    it('beginRequestCreate sets saving', () => {
      expect(reducer(initial, actions.beginRequestCreate()).saving).toBe(true)
    })

    it('successRequestCreate adds picture to null list and sets current', () => {
      const pic = makePicture({ id: 'new-1', name: 'Cuadro A' })
      const s = reducer({ ...initial, saving: true }, actions.successRequestCreate(pic))
      expect(s.list).toEqual([pic])
      expect(s.current).toEqual(pic)
      expect(s.saving).toBe(false)
    })

    it('successRequestCreate appends to existing list sorted by name', () => {
      const existing = makePicture({ id: 'z-1', name: 'Zebra' })
      const newPic = makePicture({ id: 'a-1', name: 'Alpha' })
      const s = reducer(
        { ...initial, list: [existing], saving: true },
        actions.successRequestCreate(newPic),
      )
      expect(s.list).toHaveLength(2)
      expect(s.list[0].name).toBe('Alpha')
      expect(s.list[1].name).toBe('Zebra')
    })

    it('successRequestCreate stores nodes inside current', () => {
      const node = makePictureNode({ id: 'n-1', type: 'circle' })
      const pic = makePicture({ nodes: [node] })
      const s = reducer(initial, actions.successRequestCreate(pic))
      expect(s.current.nodes).toHaveLength(1)
      expect(s.current.nodes[0].type).toBe('circle')
    })

    it('errorRequestCreate stores error and clears saving', () => {
      const s = reducer({ ...initial, saving: true }, actions.errorRequestCreate('write failed'))
      expect(s.error).toBe('write failed')
      expect(s.saving).toBe(false)
    })
  })

  describe('update (save existing)', () => {
    it('beginRequestUpdate sets saving', () => {
      expect(reducer(initial, actions.beginRequestUpdate()).saving).toBe(true)
    })

    it('successRequestUpdate merges into list by id', () => {
      const pic = makePicture({ id: 'pic-1', name: 'Original' })
      const s = reducer(
        { ...initial, list: [pic], current: pic, saving: true },
        actions.successRequestUpdate({ id: 'pic-1', name: 'Renombrado' }),
      )
      expect(s.list[0].name).toBe('Renombrado')
      expect(s.current.name).toBe('Renombrado')
      expect(s.saving).toBe(false)
    })

    it('successRequestUpdate preserves nodes when merging', () => {
      const node = makePictureNode()
      const pic = makePicture({ id: 'pic-1', nodes: [node] })
      const updated = { id: 'pic-1', name: 'Nuevo nombre', nodes: [node] }
      const s = reducer(
        { ...initial, list: [pic], current: pic },
        actions.successRequestUpdate(updated),
      )
      expect(s.current.nodes).toHaveLength(1)
    })

    it('successRequestUpdate does not touch list when list is null', () => {
      const s = reducer(
        { ...initial, list: null, current: makePicture({ id: 'pic-1' }) },
        actions.successRequestUpdate({ id: 'pic-1', name: 'X' }),
      )
      expect(s.list).toBeNull()
    })

    it('errorRequestUpdate stores error and clears saving', () => {
      const s = reducer({ ...initial, saving: true }, actions.errorRequestUpdate('save failed'))
      expect(s.error).toBe('save failed')
      expect(s.saving).toBe(false)
    })
  })

  describe('delete', () => {
    it('successRequestDelete removes picture from list', () => {
      const p1 = makePicture({ id: 'a' })
      const p2 = makePicture({ id: 'b' })
      const s = reducer(
        { ...initial, list: [p1, p2] },
        actions.successRequestDelete({ id: 'a' }),
      )
      expect(s.list).toHaveLength(1)
      expect(s.list[0].id).toBe('b')
    })

    it('successRequestDelete clears current when deleted id matches', () => {
      const pic = makePicture({ id: 'pic-1' })
      const s = reducer(
        { ...initial, list: [pic], current: pic },
        actions.successRequestDelete({ id: 'pic-1' }),
      )
      expect(s.current).toBeNull()
    })

    it('successRequestDelete leaves current intact when ids differ', () => {
      const p1 = makePicture({ id: 'a' })
      const p2 = makePicture({ id: 'b' })
      const s = reducer(
        { ...initial, list: [p1, p2], current: p2 },
        actions.successRequestDelete({ id: 'a' }),
      )
      expect(s.current.id).toBe('b')
    })
  })
})
