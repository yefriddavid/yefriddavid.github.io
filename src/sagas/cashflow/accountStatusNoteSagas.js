import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/cashflow/accountStatusNoteActions'
import * as service from '../../services/firebase/cashflow/accountStatusNotes'

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
    yield put(
      actions.successRequestCreate({
        id,
        ...payload,
        checked: false,
        createdAt: now,
        updatedAt: now,
      }),
    )
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateNote({ payload }) {
  try {
    const { id, ...fields } = payload
    yield call(service.updatePeriodNote, id, fields)
    yield put(actions.successRequestUpdate({ id, ...fields, updatedAt: new Date().toISOString() }))
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
