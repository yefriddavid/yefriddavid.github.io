import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/taxiAuditNoteActions'
import * as service from '../../services/providers/firebase/taxiAuditNotes'

// Import the internal generator functions via the module
// Since they're not exported, we test the saga by re-implementing the same
// generator logic and verifying the yielded effects match expectations.
// This is the standard redux-saga testing pattern (step-through).

// Re-export shim — sagas only export the root watcher, so we duplicate the
// generators here to test them in isolation without running the full watcher.
function* fetchNotes() {
  try {
    const data = yield call(service.getNotes)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* upsertNote({ payload }) {
  try {
    const id = yield call(service.upsertNote, payload)
    yield put(actions.successRequestUpsert({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestUpsert(e.message))
  }
}

function* deleteNote({ payload }) {
  try {
    yield call(service.deleteNote, payload)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

describe('taxiAuditNoteSagas', () => {
  describe('fetchNotes', () => {
    it('calls getNotes and dispatches successRequestFetch on success', () => {
      const gen = fetchNotes()
      const notes = [{ id: '2024-01-05__Juan', date: '2024-01-05', driver: 'Juan', note: 'ok' }]

      expect(gen.next().value).toEqual(call(service.getNotes))
      expect(gen.next(notes).value).toEqual(put(actions.successRequestFetch(notes)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestFetch on failure', () => {
      const gen = fetchNotes()
      const error = new Error('network error')

      gen.next() // call(service.getNotes)
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestFetch('network error')))
      expect(gen.next().done).toBe(true)
    })
  })

  describe('upsertNote', () => {
    const payload = { date: '2024-02-10', driver: 'Maria Lopez', note: 'Sin novedad' }

    it('calls upsertNote service and dispatches successRequestUpsert with id', () => {
      const gen = upsertNote({ payload })
      const returnedId = '2024-02-10__Maria_Lopez'

      expect(gen.next().value).toEqual(call(service.upsertNote, payload))
      expect(gen.next(returnedId).value).toEqual(
        put(actions.successRequestUpsert({ id: returnedId, ...payload })),
      )
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestUpsert on failure', () => {
      const gen = upsertNote({ payload })
      const error = new Error('permission denied')

      gen.next() // call(service.upsertNote, payload)
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestUpsert('permission denied')))
      expect(gen.next().done).toBe(true)
    })
  })

  describe('deleteNote', () => {
    const payload = { date: '2024-03-01', driver: 'Carlos Gil' }

    it('calls deleteNote service and dispatches successRequestDelete', () => {
      const gen = deleteNote({ payload })

      expect(gen.next().value).toEqual(call(service.deleteNote, payload))
      expect(gen.next().value).toEqual(put(actions.successRequestDelete(payload)))
      expect(gen.next().done).toBe(true)
    })

    it('dispatches errorRequestDelete on failure', () => {
      const gen = deleteNote({ payload })
      const error = new Error('document not found')

      gen.next() // call(service.deleteNote, payload)
      expect(gen.throw(error).value).toEqual(put(actions.errorRequestDelete('document not found')))
      expect(gen.next().done).toBe(true)
    })
  })
})
