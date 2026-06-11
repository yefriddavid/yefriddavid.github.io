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

const now = () => new Date().toISOString()

function* createList({ payload: name }) {
  try {
    const list = yield call(idb.saveList, { id: crypto.randomUUID(), name, rows: [], updatedAt: now() })
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

function* updateList({ payload: { id, name, budget, order } }) {
  try {
    const lists = yield select((s) => s.calcList.lists)
    const list = lists.find((l) => l.id === id)
    if (!list) return
    const patch = { name }
    if (budget !== undefined) patch.budget = budget
    if (order !== undefined) patch.order = order
    yield call(idb.saveList, { ...list, ...patch, updatedAt: now() })
    yield put(a.updateListSuccess({ id, name, budget, order }))
  } catch (e) {
    yield put(a.updateListError(e.message))
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
    yield call(idb.saveList, { ...list, rows, updatedAt: now() })
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
    yield call(idb.saveList, { ...list, rows, updatedAt: now() })
    yield put(a.deleteRowSuccess({ listId, rowId }))
  } catch (e) {
    yield put(a.deleteRowError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* mergeLists({ payload: remoteLists }) {
  try {
    const local = yield select((s) => s.calcList.lists)
    const merged = [...local]
    for (const remote of remoteLists) {
      const idx = merged.findIndex((l) => l.id === remote.id)
      if (idx === -1) {
        merged.push(remote)
        yield call(idb.saveList, remote)
      } else if ((remote.updatedAt ?? '') > (merged[idx].updatedAt ?? '')) {
        merged[idx] = remote
        yield call(idb.saveList, remote)
      }
    }
    yield put(a.mergeSuccess(merged))
  } catch (e) {
    yield put(a.mergeError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* importLists({ payload: importedLists }) {
  try {
    const local = yield select((s) => s.calcList.lists)
    for (const l of local) yield call(idb.deleteList, l.id)
    for (const l of importedLists) yield call(idb.saveList, l)
    yield put(a.importSuccess(importedLists))
    yield put(push({ type: 'success', message: `${importedLists.length} lista(s) importadas correctamente.` }))
  } catch (e) {
    yield put(a.importError(e.message))
    yield put(push({ type: 'error', message: `Error al importar: ${e.message}` }))
  }
}

export default function* sagaCalcList() {
  yield all([
    takeLatest(a.loadRequest, loadLists),
    takeEvery(a.createListRequest, createList),
    takeEvery(a.deleteListRequest, deleteList),
    takeEvery(a.updateListRequest, updateList),
    takeEvery(a.saveRowRequest, saveRow),
    takeEvery(a.deleteRowRequest, deleteRow),
    takeEvery(a.mergeRequest, mergeLists),
    takeEvery(a.importRequest, importLists),
  ])
}
