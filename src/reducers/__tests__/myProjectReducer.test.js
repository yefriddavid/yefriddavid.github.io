import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/myProjectReducer'
import * as actions from '../../actions/cashflow/myProjectActions'
import { makeProject } from '../../__tests__/factories'

const initial = {
  projects: [],
  loading: false,
  saving: false,
  isError: false,
  errorMessage: null,
}

describe('myProjectReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('load', () => {
    it('loadRequest sets loading and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.loadRequest())
      expect(s.loading).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('loadSuccess stores projects', () => {
      const projects = [makeProject()]
      const s = reducer({ ...initial, loading: true }, actions.loadSuccess(projects))
      expect(s.projects).toEqual(projects)
      expect(s.loading).toBe(false)
    })

    it('loadError sets isError', () => {
      const s = reducer(initial, actions.loadError('load failed'))
      expect(s.isError).toBe(true)
      expect(s.errorMessage).toBe('load failed')
    })
  })

  describe('save (upsert)', () => {
    it('saveRequest sets saving', () => {
      expect(reducer(initial, actions.saveRequest()).saving).toBe(true)
    })

    it('saveSuccess inserts new project', () => {
      const p = makeProject()
      const s = reducer({ ...initial, saving: true }, actions.saveSuccess(p))
      expect(s.projects).toEqual([p])
      expect(s.saving).toBe(false)
    })

    it('saveSuccess updates existing project by id', () => {
      const p1 = makeProject({ id: 'proj-1', name: 'Old' })
      const p2 = makeProject({ id: 'proj-2', name: 'Other' })
      const s = reducer(
        { ...initial, projects: [p1, p2] },
        actions.saveSuccess({ id: 'proj-1', name: 'New' }),
      )
      expect(s.projects.find((p) => p.id === 'proj-1').name).toBe('New')
      expect(s.projects.find((p) => p.id === 'proj-2').name).toBe('Other')
    })

    it('saveError sets isError', () => {
      const s = reducer(initial, actions.saveError('save error'))
      expect(s.isError).toBe(true)
      expect(s.saving).toBe(false)
    })
  })

  describe('delete', () => {
    it('deleteRequest sets saving', () => {
      expect(reducer(initial, actions.deleteRequest()).saving).toBe(true)
    })

    it('deleteSuccess removes project by id', () => {
      const p1 = makeProject({ id: 'proj-1' })
      const p2 = makeProject({ id: 'proj-2', name: 'Keep' })
      const s = reducer(
        { ...initial, projects: [p1, p2], saving: true },
        actions.deleteSuccess({ id: 'proj-1' }),
      )
      expect(s.projects).toHaveLength(1)
      expect(s.projects[0].id).toBe('proj-2')
    })

    it('deleteError sets isError', () => {
      const s = reducer(initial, actions.deleteError('delete error'))
      expect(s.isError).toBe(true)
    })
  })
})
