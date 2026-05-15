import { describe, it, expect } from 'vitest'
import reducer from '../taxi/taxiPeriodNoteReducer'
import * as actions from '../../actions/taxi/taxiPeriodNoteActions'
import { makePeriodNote } from '../../__tests__/factories'

const initial = { notes: [], fetching: false, saving: false, isError: false }

describe('taxiPeriodNoteReducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial)
  })

  describe('fetch', () => {
    it('fetchRequest sets fetching and clears isError', () => {
      const s = reducer({ ...initial, isError: true }, actions.fetchRequest())
      expect(s.fetching).toBe(true)
      expect(s.isError).toBe(false)
    })

    it('successRequestFetch stores notes', () => {
      const notes = [makePeriodNote()]
      const s = reducer({ ...initial, fetching: true }, actions.successRequestFetch(notes))
      expect(s.notes).toEqual(notes)
      expect(s.fetching).toBe(false)
    })

    it('errorRequestFetch sets isError', () => {
      const s = reducer({ ...initial, fetching: true }, actions.errorRequestFetch())
      expect(s.fetching).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('create', () => {
    it('createRequest sets saving', () => {
      expect(reducer(initial, actions.createRequest()).saving).toBe(true)
    })

    it('successRequestCreate appends note', () => {
      const n1 = makePeriodNote({ id: 'note-1' })
      const n2 = makePeriodNote({ id: 'note-2', text: 'Segunda nota' })
      const s = reducer(
        { ...initial, notes: [n1], saving: true },
        actions.successRequestCreate(n2),
      )
      expect(s.notes).toHaveLength(2)
      expect(s.notes[1].id).toBe('note-2')
      expect(s.saving).toBe(false)
    })

    it('errorRequestCreate sets isError', () => {
      const s = reducer({ ...initial, saving: true }, actions.errorRequestCreate())
      expect(s.saving).toBe(false)
      expect(s.isError).toBe(true)
    })
  })

  describe('update', () => {
    it('updateRequest sets saving', () => {
      expect(reducer(initial, actions.updateRequest()).saving).toBe(true)
    })

    it('successRequestUpdate merges fields by id', () => {
      const n = makePeriodNote({ id: 'note-1', text: 'old' })
      const s = reducer(
        { ...initial, notes: [n], saving: true },
        actions.successRequestUpdate({ id: 'note-1', text: 'updated' }),
      )
      expect(s.notes[0].text).toBe('updated')
      expect(s.saving).toBe(false)
    })

    it('successRequestUpdate does not affect other notes', () => {
      const n1 = makePeriodNote({ id: 'note-1' })
      const n2 = makePeriodNote({ id: 'note-2', text: 'unchanged' })
      const s = reducer(
        { ...initial, notes: [n1, n2] },
        actions.successRequestUpdate({ id: 'note-1', text: 'changed' }),
      )
      expect(s.notes.find((n) => n.id === 'note-2').text).toBe('unchanged')
    })

    it('errorRequestUpdate sets isError', () => {
      const s = reducer(initial, actions.errorRequestUpdate())
      expect(s.isError).toBe(true)
    })
  })

  describe('delete', () => {
    it('deleteRequest sets saving', () => {
      expect(reducer(initial, actions.deleteRequest()).saving).toBe(true)
    })

    it('successRequestDelete removes note by id', () => {
      const n1 = makePeriodNote({ id: 'note-1' })
      const n2 = makePeriodNote({ id: 'note-2', text: 'keep' })
      const s = reducer(
        { ...initial, notes: [n1, n2], saving: true },
        actions.successRequestDelete({ id: 'note-1' }),
      )
      expect(s.notes).toHaveLength(1)
      expect(s.notes[0].id).toBe('note-2')
      expect(s.saving).toBe(false)
    })

    it('errorRequestDelete sets isError', () => {
      const s = reducer(initial, actions.errorRequestDelete())
      expect(s.isError).toBe(true)
    })
  })
})
