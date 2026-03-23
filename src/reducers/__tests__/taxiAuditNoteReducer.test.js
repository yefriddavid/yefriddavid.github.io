import { describe, it, expect } from 'vitest'
import reducer from '../taxiAuditNoteReducer'
import * as actions from '../../actions/taxiAuditNoteActions'

const initialState = { notes: {}, fetching: false, isError: false }

describe('taxiAuditNoteReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('fetchRequest sets fetching = true', () => {
    const state = reducer(initialState, actions.fetchRequest())
    expect(state.fetching).toBe(true)
    expect(state.isError).toBe(false)
  })

  it('successRequestFetch normalizes array into object keyed by id', () => {
    const notes = [
      { id: '2024-01-05__Juan_Perez', date: '2024-01-05', driver: 'Juan Perez', note: 'Pagó tarde' },
      { id: '2024-01-06__Maria_Lopez', date: '2024-01-06', driver: 'Maria Lopez', note: 'Sin novedad' },
    ]
    const state = reducer({ ...initialState, fetching: true }, actions.successRequestFetch(notes))
    expect(state.fetching).toBe(false)
    expect(state.notes['2024-01-05__Juan_Perez']).toEqual(notes[0])
    expect(state.notes['2024-01-06__Maria_Lopez']).toEqual(notes[1])
    expect(Object.keys(state.notes)).toHaveLength(2)
  })

  it('errorRequestFetch sets isError = true and fetching = false', () => {
    const state = reducer({ ...initialState, fetching: true }, actions.errorRequestFetch('network error'))
    expect(state.fetching).toBe(false)
    expect(state.isError).toBe(true)
  })

  it('successRequestUpsert adds a new note', () => {
    const note = { id: '2024-02-10__Carlos_Gil', date: '2024-02-10', driver: 'Carlos Gil', note: 'Faltó' }
    const state = reducer(initialState, actions.successRequestUpsert(note))
    expect(state.notes['2024-02-10__Carlos_Gil']).toEqual(note)
  })

  it('successRequestUpsert updates an existing note', () => {
    const existing = { id: '2024-02-10__Carlos_Gil', date: '2024-02-10', driver: 'Carlos Gil', note: 'Faltó' }
    const updated = { ...existing, note: 'Pagó al día siguiente' }
    const prevState = { ...initialState, notes: { [existing.id]: existing } }
    const state = reducer(prevState, actions.successRequestUpsert(updated))
    expect(state.notes[existing.id].note).toBe('Pagó al día siguiente')
  })

  it('successRequestDelete removes note by computed id (spaces → underscores)', () => {
    const id = '2024-03-15__Pedro Rodriguez'
    const note = { id: '2024-03-15__Pedro_Rodriguez', date: '2024-03-15', driver: 'Pedro Rodriguez', note: 'Prueba' }
    const prevState = { ...initialState, notes: { [note.id]: note } }
    const state = reducer(prevState, actions.successRequestDelete({ date: '2024-03-15', driver: 'Pedro Rodriguez' }))
    expect(state.notes['2024-03-15__Pedro_Rodriguez']).toBeUndefined()
  })

  it('successRequestDelete does not affect other notes', () => {
    const noteA = { id: '2024-03-15__Driver_A', date: '2024-03-15', driver: 'Driver A', note: 'A' }
    const noteB = { id: '2024-03-15__Driver_B', date: '2024-03-15', driver: 'Driver B', note: 'B' }
    const prevState = { ...initialState, notes: { [noteA.id]: noteA, [noteB.id]: noteB } }
    const state = reducer(prevState, actions.successRequestDelete({ date: '2024-03-15', driver: 'Driver A' }))
    expect(state.notes['2024-03-15__Driver_A']).toBeUndefined()
    expect(state.notes['2024-03-15__Driver_B']).toEqual(noteB)
  })
})
