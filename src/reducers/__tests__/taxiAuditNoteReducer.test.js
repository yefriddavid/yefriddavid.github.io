import { describe, it, expect } from 'vitest'
import reducer from '../taxiAuditNoteReducer'
import * as actions from '../../actions/taxiAuditNoteActions'
import { makeAuditNote } from '../../__tests__/factories'

const initial = { notes: {}, fetching: false, isError: false }

describe('taxiAuditNoteReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch normalizes array into object keyed by id', () => {
      const notes = [
        makeAuditNote({ id: '2024-01-05__Juan_Perez', date: '2024-01-05', driver: 'Juan Perez' }),
        makeAuditNote({ id: '2024-01-06__Maria_Lopez', date: '2024-01-06', driver: 'Maria Lopez', note: 'Sin novedad' }),
      ]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(notes))
      expect(s.fetching).toBe(false)
      expect(s.notes['2024-01-05__Juan_Perez']).toEqual(notes[0])
      expect(s.notes['2024-01-06__Maria_Lopez']).toEqual(notes[1])
      expect(Object.keys(s.notes)).toHaveLength(2)
    })

    it('successRequestFetch overwrites existing notes (full refresh)', () => {
      const old = makeAuditNote({ id: 'old-key' })
      const fresh = makeAuditNote({ id: '2024-03-10__Juan_Perez' })
      const prev = { ...initial, notes: { 'old-key': old } }
      const s = reducer(prev, actions.successRequestFetch([fresh]))
      expect(s.notes['old-key']).toBeUndefined()
      expect(s.notes['2024-03-10__Juan_Perez']).toEqual(fresh)
    })

    it('errorRequestFetch sets isError and clears fetching', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch('network error'))
      expect(s.isError).toBe(true)
      expect(s.fetching).toBe(false)
    })
  })

  // ── Upsert ────────────────────────────────────────────────────────────────
  describe('upsert', () => {
    it('successRequestUpsert adds a new note', () => {
      const note = makeAuditNote()
      const s = reducer(initial, actions.successRequestUpsert(note))
      expect(s.notes[note.id]).toEqual(note)
    })

    it('successRequestUpsert updates an existing note text', () => {
      const note = makeAuditNote()
      const updated = { ...note, note: 'Nota actualizada' }
      const prev = { ...initial, notes: { [note.id]: note } }
      const s = reducer(prev, actions.successRequestUpsert(updated))
      expect(s.notes[note.id].note).toBe('Nota actualizada')
    })
  })

  // ── Delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('successRequestDelete removes note using computed id (spaces → underscores)', () => {
      const note = makeAuditNote({ id: '2024-03-15__Pedro_Rodriguez', driver: 'Pedro Rodriguez' })
      const prev = { ...initial, notes: { [note.id]: note } }
      const s = reducer(prev, actions.successRequestDelete({ date: '2024-03-15', driver: 'Pedro Rodriguez' }))
      expect(s.notes['2024-03-15__Pedro_Rodriguez']).toBeUndefined()
    })

    it('successRequestDelete handles multi-word driver names', () => {
      const note = makeAuditNote({ id: '2024-01-01__Maria_Del_Carmen', driver: 'Maria Del Carmen' })
      const prev = { ...initial, notes: { [note.id]: note } }
      const s = reducer(prev, actions.successRequestDelete({ date: '2024-01-01', driver: 'Maria Del Carmen' }))
      expect(s.notes['2024-01-01__Maria_Del_Carmen']).toBeUndefined()
    })

    it('successRequestDelete does not affect other notes', () => {
      const nA = makeAuditNote({ id: '2024-03-15__Driver_A', driver: 'Driver A' })
      const nB = makeAuditNote({ id: '2024-03-15__Driver_B', driver: 'Driver B', note: 'B' })
      const prev = { ...initial, notes: { [nA.id]: nA, [nB.id]: nB } }
      const s = reducer(prev, actions.successRequestDelete({ date: '2024-03-15', driver: 'Driver A' }))
      expect(s.notes['2024-03-15__Driver_A']).toBeUndefined()
      expect(s.notes['2024-03-15__Driver_B']).toEqual(nB)
    })
  })
})
