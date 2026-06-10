import { put, call, all, takeLatest, takeEvery, select } from 'redux-saga/effects'
import * as a from '../../actions/finance/calcListActions'
import * as idb from '../../services/indexeddb/finance/calcList'
import { push } from '../../reducers/notificationsSlice'

function* loadLists() {
  try {
    const lists = yield call(idb.fetchAll)
    yield put(a.loadSuccess(lists))
  } catch (e) {
    yield put(a.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* createList({ payload: name }) {
  try {
    const list = yield call(idb.saveList, { id: crypto.randomUUID(), name, rows: [] })
    yield put(a.createListSuccess(list))
  } catch (e) {
    yield put(a.createListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteList({ payload: id }) {
  try {
    yield call(idb.deleteList, id)
    yield put(a.deleteListSuccess(id))
  } catch (e) {
    yield put(a.deleteListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* renameList({ payload: { id, name } }) {
  try {
    const lists = yield select((s) => s.calcList.lists)
    const list = lists.find((l) => l.id === id)
    if (!list) return
    yield call(idb.saveList, { ...list, name })
    yield put(a.renameListSuccess({ id, name }))
  } catch (e) {
    yield put(a.renameListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveRow({ payload: { listId, row } }) {
  try {
    const lists = yield select((s) => s.calcList.lists)
    const list = lists.find((l) => l.id === listId)
    if (!list) return
    const rows = list.rows.some((r) => r.id === row.id)
      ? list.rows.map((r) => (r.id === row.id ? row : r))
      : [...list.rows, row]
    yield call(idb.saveList, { ...list, rows })
    yield put(a.saveRowSuccess({ listId, row }))
  } catch (e) {
    yield put(a.saveRowError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteRow({ payload: { listId, rowId } }) {
  try {
    const lists = yield select((s) => s.calcList.lists)
    const list = lists.find((l) => l.id === listId)
    if (!list) return
    const rows = list.rows.filter((r) => r.id !== rowId)
    yield call(idb.saveList, { ...list, rows })
    yield put(a.deleteRowSuccess({ listId, rowId }))
  } catch (e) {
    yield put(a.deleteRowError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

export default function* sagaCalcList() {
  yield all([
    takeLatest(a.loadRequest, loadLists),
    takeEvery(a.createListRequest, createList),
    takeEvery(a.deleteListRequest, deleteList),
    takeEvery(a.renameListRequest, renameList),
    takeEvery(a.saveRowRequest, saveRow),
    takeEvery(a.deleteRowRequest, deleteRow),
  ])
}
