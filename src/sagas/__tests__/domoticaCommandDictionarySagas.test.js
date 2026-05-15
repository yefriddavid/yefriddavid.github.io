import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCommandDictionaryActions'
import * as service from '../../services/facade/domotica/domoticaCommandDictionaryFacade'
import {
  fetchDictionary,
  createEntry,
  updateEntry,
  deleteEntry,
  seedDictionary,
} from '../domotica/domoticaCommandDictionarySagas'

const makeEntry = (overrides = {}) => ({
  id: 'cmd-1',
  category: 'GPS',
  command: 'AT+CGDCONT',
  name: 'Configurar APN',
  description: '',
  queryFormat: 'N/A',
  readFormat: 'N/A',
  writeFormat: 'AT+CGDCONT=1,"IP","internet.comcel.com.co","",0,0',
  params: '',
  notes: '',
  isCustom: false,
  ...overrides,
})

describe('domoticaCommandDictionarySagas', () => {
  describe('fetchDictionary', () => {
    it('begin → fetchCommandDictionary → success', () => {
      const data = [makeEntry()]
      const gen = fetchDictionary()
      expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
      expect(gen.next().value).toEqual(call(service.fetchCommandDictionary))
      expect(gen.next(data).value).toEqual(put(actions.successRequestFetch(data)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestFetch', () => {
      const gen = fetchDictionary()
      gen.next()
      gen.next()
      expect(gen.throw(new Error('network error')).value).toEqual(
        put(actions.errorRequestFetch('network error')),
      )
    })
  })

  describe('createEntry', () => {
    it('begin → createCommandEntry → success with isCustom:true', () => {
      const payload = makeEntry({ id: undefined, isCustom: false })
      const newId = 'cmd-new'
      const gen = createEntry({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
      expect(gen.next().value).toEqual(call(service.createCommandEntry, payload))
      expect(gen.next(newId).value).toEqual(
        put(actions.successRequestCreate({ id: newId, ...payload, isCustom: true })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestCreate', () => {
      const gen = createEntry({ payload: makeEntry() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('write failed')).value).toEqual(
        put(actions.errorRequestCreate('write failed')),
      )
    })
  })

  describe('updateEntry', () => {
    it('begin → updateCommandEntry(id, payload) → success', () => {
      const payload = makeEntry()
      const gen = updateEntry({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
      expect(gen.next().value).toEqual(call(service.updateCommandEntry, payload.id, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestUpdate(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestUpdate', () => {
      const gen = updateEntry({ payload: makeEntry() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('permission denied')).value).toEqual(
        put(actions.errorRequestUpdate('permission denied')),
      )
    })
  })

  describe('deleteEntry', () => {
    it('begin → deleteCommandEntry(id) → success', () => {
      const payload = makeEntry()
      const gen = deleteEntry({ payload })
      expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
      expect(gen.next().value).toEqual(call(service.deleteCommandEntry, payload.id))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestDelete', () => {
      const gen = deleteEntry({ payload: makeEntry() })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(
        put(actions.errorRequestDelete('not found')),
      )
    })
  })

  describe('seedDictionary', () => {
    it('begin → seedCommandDictionary → fetchCommandDictionary → success', () => {
      const commands = [makeEntry({ id: undefined })]
      const seeded = [makeEntry()]
      const gen = seedDictionary({ payload: commands })
      expect(gen.next().value).toEqual(put(actions.beginRequestSeed()))
      expect(gen.next().value).toEqual(call(service.seedCommandDictionary, commands))
      expect(gen.next().value).toEqual(call(service.fetchCommandDictionary))
      expect(gen.next(seeded).value).toEqual(put(actions.successRequestSeed(seeded)))
      expect(gen.next().done).toBe(true)
    })

    it('error path dispatches errorRequestSeed', () => {
      const gen = seedDictionary({ payload: [] })
      gen.next()
      gen.next()
      expect(gen.throw(new Error('batch write failed')).value).toEqual(
        put(actions.errorRequestSeed('batch write failed')),
      )
    })
  })
})
