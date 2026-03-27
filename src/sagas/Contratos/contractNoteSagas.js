import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/Contratos/contractNoteActions'
import * as service from '../../services/providers/firebase/Contratos/contractNotes'

function* fetchNotes({ payload }) {
  try {
    const data = yield call(service.fetchContractNotes, payload.contractId)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createNote({ payload }) {
  try {
    const id = yield call(service.createContractNote, payload)
    const now = new Date().toISOString()
    yield put(
      actions.successRequestCreate({
        id,
        ...payload,
        resolved: false,
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
    yield call(service.updateContractNote, payload.id, {
      text: payload.text,
      resolved: payload.resolved,
    })
    yield put(
      actions.successRequestUpdate({
        id: payload.id,
        text: payload.text,
        resolved: payload.resolved,
        updatedAt: new Date().toISOString(),
      }),
    )
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteNote({ payload }) {
  try {
    yield call(service.deleteContractNote, payload.id)
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
