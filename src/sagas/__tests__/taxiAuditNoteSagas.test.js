import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiAuditNoteActions'
import * as service from '../../services/providers/firebase/Taxi/taxiAuditNotes'
import { fetchNotes, upsertNote, deleteNote } from '../Taxi/taxiAuditNoteSagas'
import { makeAuditNote } from '../../__tests__/factories'

describe('taxiAuditNoteSagas', () => {
  describe('fetchNotes', () => {
    it('calls getNotes then dispatches successRequestFetch', () => {
      const gen = fetchNotes()
      const notes = [makeAuditNote()]
      expect(gen.next().value).toEqual(call(service.getNotes))
      expect(gen.next(notes).value).toEqual(put(actions.successRequestFetch(notes)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on failure', () => {
      const gen = fetchNotes()
      gen.next()
      expect(gen.throw(new Error('network error')).value).toEqual(put(actions.errorRequestFetch('network error')))
    })
  })

  describe('upsertNote', () => {
    it('calls upsertNote and dispatches success with returned id merged into payload', () => {
      const payload = { date: '2024-03-10', driver: 'Juan Perez', note: 'Sin novedad' }
      const returnedId = '2024-03-10__Juan_Perez'
      const gen = upsertNote({ payload })

      expect(gen.next().value).toEqual(call(service.upsertNote, payload))
      expect(gen.next(returnedId).value).toEqual(
        put(actions.successRequestUpsert({ id: returnedId, ...payload })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestUpsert on failure', () => {
      const gen = upsertNote({ payload: makeAuditNote() })
      gen.next()
      expect(gen.throw(new Error('permission denied')).value).toEqual(
        put(actions.errorRequestUpsert('permission denied')),
      )
    })
  })

  describe('deleteNote', () => {
    it('calls deleteNote and dispatches successRequestDelete with original payload', () => {
      const payload = { date: '2024-03-01', driver: 'Carlos Gil' }
      const gen = deleteNote({ payload })

      expect(gen.next().value).toEqual(call(service.deleteNote, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on failure', () => {
      const gen = deleteNote({ payload: { date: '2024-03-01', driver: 'Carlos' } })
      gen.next()
      expect(gen.throw(new Error('not found')).value).toEqual(put(actions.errorRequestDelete('not found')))
    })
  })
})
