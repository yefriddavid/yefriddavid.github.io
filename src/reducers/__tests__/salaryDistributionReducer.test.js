import { describe, it, expect } from 'vitest'
import reducer from '../cashflow/salaryDistributionReducer'
import * as actions from '../../actions/cashflow/salaryDistributionActions'

const initial = {
  data: null,
  fetching: false,
  saving: false,
  syncing: false,
  importing: false,
  error: {},
  isError: false,
}

const DEFAULT_DISTRIBUTIONS = [
  {
    id: 'default',
    name: 'Principal',
    salary: 5000,
    invert: 2000,
    invertTarget: '',
    rows: [
      { id: 1, name: 'car', type: 'percent', value: 10 },
      { id: 2, name: 'col', type: 'percent', value: 20 },
      { id: 3, name: 'ocio', type: 'remainder', value: 0 },
    ],
  },
]

const validArray = [{ id: 'dist-1', name: 'My dist', salary: 3000, invert: 1000, invertTarget: '', rows: [] }]

describe('salaryDistributionReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('beginRequestFetch sets fetching', () => {
      const s = reducer({ ...initial, isError: true }, actions.beginRequestFetch())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores array payload directly', () => {
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(validArray))
      expect(s.data).toEqual(validArray)
      expect(s.fetching).toBe(false)
    })

    it('successRequestFetch returns defaults when payload is null', () => {
      const s = reducer(initial, actions.successRequestFetch(null))
      expect(s.data).toEqual(DEFAULT_DISTRIBUTIONS)
    })

    it('successRequestFetch wraps old single-object format in array', () => {
      const oldFormat = { salary: 3000, invert: 500, rows: [] }
      const s = reducer(initial, actions.successRequestFetch(oldFormat))
      expect(Array.isArray(s.data)).toBe(true)
      expect(s.data[0].id).toBe('default')
    })

    it('errorRequestFetch sets defaults and isError', () => {
      const s = reducer(initial, actions.errorRequestFetch('network error'))
      expect(s.data).toEqual(DEFAULT_DISTRIBUTIONS)
      expect(s.isError).toBe(true)
      expect(s.fetching).toBe(false)
    })
  })

  describe('save', () => {
    it('beginRequestSave sets saving', () => {
      expect(reducer(initial, actions.beginRequestSave()).saving).toBe(true)
    })

    it('successRequestSave stores payload', () => {
      const s = reducer({ ...initial, saving: true }, actions.successRequestSave(validArray))
      expect(s.data).toEqual(validArray)
      expect(s.saving).toBe(false)
    })

    it('errorRequestSave sets isError', () => {
      const s = reducer(initial, actions.errorRequestSave('save error'))
      expect(s.isError).toBe(true)
      expect(s.saving).toBe(false)
    })
  })

  describe('sync', () => {
    it('syncRequest sets syncing', () => {
      expect(reducer(initial, actions.syncRequest()).syncing).toBe(true)
    })

    it('syncSuccess stores payload', () => {
      const s = reducer({ ...initial, syncing: true }, actions.syncSuccess(validArray))
      expect(s.data).toEqual(validArray)
      expect(s.syncing).toBe(false)
    })

    it('syncError sets isError', () => {
      const s = reducer(initial, actions.syncError('sync error'))
      expect(s.isError).toBe(true)
      expect(s.syncing).toBe(false)
    })
  })

  describe('import', () => {
    it('importRequest sets importing', () => {
      expect(reducer(initial, actions.importRequest()).importing).toBe(true)
    })

    it('importSuccess stores payload', () => {
      const s = reducer({ ...initial, importing: true }, actions.importSuccess(validArray))
      expect(s.data).toEqual(validArray)
      expect(s.importing).toBe(false)
    })

    it('importError sets isError', () => {
      const s = reducer(initial, actions.importError('import error'))
      expect(s.isError).toBe(true)
      expect(s.importing).toBe(false)
    })
  })
})
