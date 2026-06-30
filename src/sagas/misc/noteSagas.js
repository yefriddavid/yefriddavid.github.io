import { eventChannel } from 'redux-saga'
import { put, call, take, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/misc/noteActions'
import * as service from '../../services/firebase/misc/notes'
import { push as notify } from '../../reducers/notificationsSlice'

function createNotesChannel() {
  return eventChannel((emit) => service.subscribeNotes(emit))
}

function* fetchNotes() {
  try {
    yield put(actions.beginRequestFetch())
    const channel = yield call(createNotesChannel)
    try {
      while (true) {
        const data = yield take(channel)
        yield put(actions.successRequestFetch(data))
      }
    } finally {
      channel.close()
    }
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createNote({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const note = yield call(service.createNote, payload)
    yield put(actions.successRequestCreate(note))
    yield put(notify({ type: 'success', message: 'Nota creada.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error al crear nota: ${e.message}` }))
  }
}

function* updateNote({ payload }) {
  try {
    yield call(service.updateNote, payload)
    yield put(actions.successRequestUpdate(payload))
    yield put(notify({ type: 'success', message: 'Nota guardada.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar: ${e.message}` }))
  }
}

function* deleteNote({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteNote, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Nota eliminada.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error al eliminar: ${e.message}` }))
  }
}

function* reorderNotes({ payload }) {
  try {
    yield call(service.reorderNotes, payload)
  } catch (e) {
    yield put(notify({ type: 'error', message: `Error al reordenar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchNotes),
    takeLatest(actions.createRequest, createNote),
    takeLatest(actions.updateRequest, updateNote),
    takeLatest(actions.deleteRequest, deleteNote),
    takeLatest(actions.reorderRequest, reorderNotes),
  ])
}
