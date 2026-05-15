import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/myProjectReducer'
import * as actions from '../../actions/cashflow/myProjectActions'
import { makeProject } from '../../__tests__/factories'

const initial = {
  projects: [],
  loading: false,
  saving: false,
  syncing: false,
  syncingAll: false,
  importing: false,
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

  describe('sync', () => {
    it('syncRequest sets syncing', () => {
      expect(reducer(initial, actions.syncRequest()).syncing).toBe(true)
    })

    it('syncSuccess updates syncedAt for matching project', () => {
      const p = makeProject({ id: 'proj-1', syncedAt: null })
      const s = reducer(
        { ...initial, projects: [p], syncing: true },
        actions.syncSuccess({ id: 'proj-1', syncedAt: '2024-03-10T10:00:00Z' }),
      )
      expect(s.projects[0].syncedAt).toBe('2024-03-10T10:00:00Z')
      expect(s.syncing).toBe(false)
    })

    it('syncError sets isError', () => {
      const s = reducer(initial, actions.syncError('sync error'))
      expect(s.isError).toBe(true)
      expect(s.syncing).toBe(false)
    })
  })

  describe('syncAll', () => {
    it('syncAllRequest sets syncingAll', () => {
      expect(reducer(initial, actions.syncAllRequest()).syncingAll).toBe(true)
    })

    it('syncAllSuccess updates syncedAt for each project', () => {
      const p1 = makeProject({ id: 'proj-1', syncedAt: null })
      const p2 = makeProject({ id: 'proj-2', syncedAt: null })
      const s = reducer(
        { ...initial, projects: [p1, p2], syncingAll: true },
        actions.syncAllSuccess([
          { id: 'proj-1', syncedAt: '2024-03-10T10:00:00Z' },
          { id: 'proj-2', syncedAt: '2024-03-10T10:01:00Z' },
        ]),
      )
      expect(s.projects[0].syncedAt).toBe('2024-03-10T10:00:00Z')
      expect(s.projects[1].syncedAt).toBe('2024-03-10T10:01:00Z')
      expect(s.syncingAll).toBe(false)
    })

    it('syncAllError sets isError', () => {
      const s = reducer(initial, actions.syncAllError('sync all error'))
      expect(s.isError).toBe(true)
      expect(s.syncingAll).toBe(false)
    })
  })

  describe('import', () => {
    it('importRequest sets importing and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.importRequest())
      expect(s.importing).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('importSuccess replaces projects', () => {
      const imported = [makeProject({ id: 'proj-new' })]
      const s = reducer(
        { ...initial, projects: [makeProject({ id: 'proj-old' })], importing: true },
        actions.importSuccess(imported),
      )
      expect(s.projects).toEqual(imported)
      expect(s.importing).toBe(false)
    })

    it('importError sets isError', () => {
      const s = reducer(initial, actions.importError('import error'))
      expect(s.isError).toBe(true)
      expect(s.importing).toBe(false)
    })
  })
})
