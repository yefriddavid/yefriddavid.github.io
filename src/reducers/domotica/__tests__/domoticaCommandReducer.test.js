import { describe, it, expect } from 'vitest'
import reducer from '../domoticaCommandReducer'
import * as actions from '../../../actions/domotica/domoticaCommandActions'
import { makeDomoticaCommand } from '../../../__tests__/factories'

const initial = { commands: {}, fetching: false, updatingIds: {}, isError: false }

describe('domoticaCommandReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('fetchSuccess stores commands map', () => {
      const commands = { 'cmd-1': makeDomoticaCommand({ id: 'cmd-1' }) }
      const s = reducer({ ...initial, fetching: true }, actions.fetchSuccess(commands))
      expect(s.commands).toEqual(commands)
      expect(s.fetching).toBe(false)
    })

    it('fetchError sets isError', () => {
      const s = reducer({ ...initial, fetching: true }, actions.fetchError())
      expect(s.fetching).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('update (optimistic)', () => {
    it('updateRequest marks id as updating and applies fields immediately', () => {
      const existing = { commands: { 'cmd-1': makeDomoticaCommand({ id: 'cmd-1', active: true }) }, fetching: false, updatingIds: {}, isError: false }
      const s = reducer(existing, actions.updateRequest({ id: 'cmd-1', active: false }))
      expect(s.updatingIds['cmd-1']).toBe(true)
      expect(s.commands['cmd-1'].active).toBe(false)
    })

    it('updateRequest creates a new entry if command does not exist', () => {
      const s = reducer(initial, actions.updateRequest({ id: 'cmd-new', name: 'New' }))
      expect(s.commands['cmd-new']).toMatchObject({ id: 'cmd-new', name: 'New' })
    })

    it('updateSuccess removes id from updatingIds', () => {
      const state = { ...initial, updatingIds: { 'cmd-1': true } }
      const s = reducer(state, actions.updateSuccess({ id: 'cmd-1' }))
      expect(s.updatingIds['cmd-1']).toBeUndefined()
    })

    it('updateError also removes id from updatingIds', () => {
      const state = { ...initial, updatingIds: { 'cmd-1': true } }
      const s = reducer(state, actions.updateError({ id: 'cmd-1' }))
      expect(s.updatingIds['cmd-1']).toBeUndefined()
    })
  })
})
