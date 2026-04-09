import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiPeriodNoteActions'
import * as service from '../../services/providers/firebase/Taxi/taxiPeriodNotes'

function* fetchNotes({ payload }) {
  try {
    const data = yield call(service.fetchPeriodNotes, payload.period)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createNote({ payload }) {
  try {
    const id = yield call(service.createPeriodNote, payload)
    const now = new Date().toISOString()
    yield put(actions.successRequestCreate({ id, ...payload, createdAt: now, updatedAt: now }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateNote({ payload }) {
  try {
    yield call(service.updatePeriodNote, payload.id, payload.text)
    yield put(actions.successRequestUpdate({ id: payload.id, text: payload.text, updatedAt: new Date().toISOString() }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteNote({ payload }) {
  try {
    yield call(service.deletePeriodNote, payload.id)
    yield put(actions.successRequestDelete({ id: payload.id }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
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
