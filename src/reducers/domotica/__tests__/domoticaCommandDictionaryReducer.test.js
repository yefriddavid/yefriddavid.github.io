import { describe, it, expect } from 'vitest'
import reducer from '../domoticaCommandDictionaryReducer'
import * as actions from '../../../actions/domotica/domoticaCommandDictionaryActions'

const initial = {
  data: null,
  fetching: false,
  saving: false,
  seeding: false,
  isError: false,
  error: {},
}

const makeEntry = (overrides = {}) => ({
  id: 'dict-1',
  command: 'RELAY_ON',
  description: 'Encender relé',
  category: 'control',
  ...overrides,
})

describe('domoticaCommandDictionaryReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('beginRequestFetch also sets fetching', () => {
      expect(reducer(initial, actions.beginRequestFetch()).fetching).toBe(true)
    })

    it('successRequestFetch stores data', () => {
      const entries = [makeEntry()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(entries))
      expect(s.data).toEqual(entries)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer(initial, actions.errorRequestFetch('network error'))
      expect(s.isError).toBe(true)
      expect(s.error).toBe('network error')
    })
  })

  describe('create', () => {
    it('beginRequestCreate sets saving', () => {
      expect(reducer(initial, actions.beginRequestCreate()).saving).toBe(true)
    })

    it('successRequestCreate appends entry', () => {
      const e1 = makeEntry({ id: 'dict-1' })
      const e2 = makeEntry({ id: 'dict-2', command: 'RELAY_OFF' })
      const s = reducer(
        { ...initial, data: [e1], saving: true },
        actions.successRequestCreate(e2),
      )
      expect(s.data).toHaveLength(2)
      expect(s.data[1].id).toBe('dict-2')
      expect(s.saving).toBe(false)
    })

    it('successRequestCreate initializes data when null', () => {
      const e = makeEntry()
      expect(reducer(initial, actions.successRequestCreate(e)).data).toEqual([e])
    })

    it('errorRequestCreate sets isError', () => {
      const s = reducer(initial, actions.errorRequestCreate('create error'))
      expect(s.isError).toBe(true)
      expect(s.saving).toBe(false)
    })
  })

  describe('update', () => {
    it('beginRequestUpdate sets saving', () => {
      expect(reducer(initial, actions.beginRequestUpdate()).saving).toBe(true)
    })

    it('successRequestUpdate replaces entry by id', () => {
      const e1 = makeEntry({ id: 'dict-1', description: 'Old' })
      const e2 = makeEntry({ id: 'dict-2', command: 'OTHER' })
      const updated = makeEntry({ id: 'dict-1', description: 'New' })
      const s = reducer(
        { ...initial, data: [e1, e2], saving: true },
        actions.successRequestUpdate(updated),
      )
      expect(s.data.find((e) => e.id === 'dict-1').description).toBe('New')
      expect(s.data.find((e) => e.id === 'dict-2').command).toBe('OTHER')
      expect(s.saving).toBe(false)
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

    it('successRequestDelete removes entry by id', () => {
      const e1 = makeEntry({ id: 'dict-1' })
      const e2 = makeEntry({ id: 'dict-2', command: 'KEEP' })
      const s = reducer(
        { ...initial, data: [e1, e2], saving: true },
        actions.successRequestDelete({ id: 'dict-1' }),
      )
      expect(s.data).toHaveLength(1)
      expect(s.data[0].id).toBe('dict-2')
      expect(s.saving).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete('delete error'))
      expect(s.isError).toBe(true)
    })
  })

  describe('seed', () => {
    it('beginRequestSeed sets seeding', () => {
      expect(reducer(initial, actions.beginRequestSeed()).seeding).toBe(true)
    })

    it('successRequestSeed replaces data', () => {
      const seeded = [makeEntry({ id: 'seeded-1' })]
      const s = reducer({ ...initial, seeding: true }, actions.successRequestSeed(seeded))
      expect(s.data).toEqual(seeded)
      expect(s.seeding).toBe(false)
    })

    it('errorRequestSeed sets isError', () => {
      const s = reducer(initial, actions.errorRequestSeed('seed error'))
      expect(s.seeding).toBe(false)
      expect(s.isError).toBe(true)
    })
  })
})
