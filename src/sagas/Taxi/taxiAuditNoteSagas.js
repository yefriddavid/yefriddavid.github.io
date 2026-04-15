import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Taxi/taxiAuditNoteActions'
import * as service from '../../services/providers/firebase/Taxi/taxiAuditNotes'

export function* fetchNotes() {
  try {
    const data = yield call(service.getNotes)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* upsertNote({ payload }) {
  try {
    const id = yield call(service.upsertNote, payload)
    yield put(actions.successRequestUpsert({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorRequestUpsert(e.message))
  }
}

export function* deleteNote({ payload }) {
  try {
    yield call(service.deleteNote, payload)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchNotes),
    takeLatest(actions.upsertRequest, upsertNote),
    takeLatest(actions.deleteRequest, deleteNote),
  ])
}
