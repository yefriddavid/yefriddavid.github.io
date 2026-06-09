import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/contratos/contractModuleNoteActions'
import * as service from '../../services/facade/contratos/contractModuleNotesFacade'
import { push } from '../../reducers/notificationsSlice'

function* fetchNotes() {
  try {
    const data = yield call(service.fetchModuleNotes)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* createNote({ payload }) {
  try {
    const id = yield call(service.createModuleNote, payload.text)
    const now = new Date().toISOString()
    yield put(actions.successRequestCreate({ id, text: payload.text, createdAt: now, updatedAt: now }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* updateNote({ payload }) {
  try {
    yield call(service.updateModuleNote, payload.id, payload.text)
    yield put(actions.successRequestUpdate({ id: payload.id, text: payload.text, updatedAt: new Date().toISOString() }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteNote({ payload }) {
  try {
    yield call(service.deleteModuleNote, payload.id)
    yield put(actions.successRequestDelete({ id: payload.id }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchNotes),
    takeLatest(actions.createRequest, createNote),
    takeLatest(actions.updateRequest, updateNote),
    takeLatest(actions.deleteRequest, deleteNote),
  ])
}
