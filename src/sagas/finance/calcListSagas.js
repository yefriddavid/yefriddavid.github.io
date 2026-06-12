import { put, call, all, takeLatest, takeEvery, select } from 'redux-saga/effects'
import * as a from '../../actions/finance/calcListActions'
import * as idb from '../../services/indexeddb/finance/calcList'
import { push } from '../../reducers/notificationsSlice'

const now = () => new Date().toISOString()

function* loadLists() {
  try {
    const all = yield call(idb.fetchAll)
    const groups   = []
    const oldLists = []
    for (const doc of all) {
      if (Array.isArray(doc.items)) groups.push(doc)
      else if (Array.isArray(doc.rows)) oldLists.push(doc)
    }
    if (oldLists.length > 0) {
      const sorted = [...oldLists].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
      const defaultGroup = {
        id: crypto.randomUUID(),
        name: 'General',
        order: 0,
        items: sorted.map((l, i) => ({ ...l, order: i })),
        updatedAt: now(),
      }
      yield call(idb.saveList, defaultGroup)
      for (const l of oldLists) yield call(idb.deleteList, l.id)
      groups.push(defaultGroup)
    }
    groups.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    yield put(a.loadSuccess(groups))
  } catch (e) {
    yield put(a.loadError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* createGroup({ payload: name }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = { id: crypto.randomUUID(), name, order: groups.length, items: [], updatedAt: now() }
    yield call(idb.saveList, group)
    yield put(a.createGroupSuccess(group))
  } catch (e) {
    yield put(a.createGroupError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteGroup({ payload: id }) {
  try {
    yield call(idb.deleteList, id)
    yield put(a.deleteGroupSuccess(id))
  } catch (e) {
    yield put(a.deleteGroupError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* updateGroup({ payload: { id, name, order } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === id)
    if (!group) return
    const patch = { name }
    if (order !== undefined) patch.order = order
    yield call(idb.saveList, { ...group, ...patch, updatedAt: now() })
    yield put(a.updateGroupSuccess({ id, name, order }))
  } catch (e) {
    yield put(a.updateGroupError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* createList({ payload: { groupId, name } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const list = { id: crypto.randomUUID(), name, order: group.items.length, budget: null, rows: [], updatedAt: now() }
    const updated = { ...group, items: [...group.items, list], updatedAt: now() }
    yield call(idb.saveList, updated)
    yield put(a.createListSuccess({ groupId, list }))
  } catch (e) {
    yield put(a.createListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteList({ payload: { groupId, listId } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const updated = { ...group, items: group.items.filter((l) => l.id !== listId), updatedAt: now() }
    yield call(idb.saveList, updated)
    yield put(a.deleteListSuccess({ groupId, listId }))
  } catch (e) {
    yield put(a.deleteListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* updateList({ payload: { groupId, id, name, budget, order } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const list = group.items.find((l) => l.id === id)
    if (!list) return
    const patch = { name }
    if (budget !== undefined) patch.budget = budget
    if (order !== undefined) patch.order = order
    const updatedList = { ...list, ...patch, updatedAt: now() }
    const updated = {
      ...group,
      items: group.items.map((l) => (l.id === id ? updatedList : l)),
      updatedAt: now(),
    }
    yield call(idb.saveList, updated)
    yield put(a.updateListSuccess({ groupId, id, name, budget, order }))
  } catch (e) {
    yield put(a.updateListError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* saveRow({ payload: { groupId, listId, row } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const list = group.items.find((l) => l.id === listId)
    if (!list) return
    const rows = list.rows.some((r) => r.id === row.id)
      ? list.rows.map((r) => (r.id === row.id ? row : r))
      : [...list.rows, row]
    const updatedList = { ...list, rows, updatedAt: now() }
    const updated = {
      ...group,
      items: group.items.map((l) => (l.id === listId ? updatedList : l)),
      updatedAt: now(),
    }
    yield call(idb.saveList, updated)
    yield put(a.saveRowSuccess({ groupId, listId, row }))
  } catch (e) {
    yield put(a.saveRowError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* deleteRow({ payload: { groupId, listId, rowId } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const list = group.items.find((l) => l.id === listId)
    if (!list) return
    const rows = list.rows.filter((r) => r.id !== rowId)
    const updatedList = { ...list, rows, updatedAt: now() }
    const updated = {
      ...group,
      items: group.items.map((l) => (l.id === listId ? updatedList : l)),
      updatedAt: now(),
    }
    yield call(idb.saveList, updated)
    yield put(a.deleteRowSuccess({ groupId, listId, rowId }))
  } catch (e) {
    yield put(a.deleteRowError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* reorderRows({ payload: { groupId, listId, orderedIds } }) {
  try {
    const groups = yield select((s) => s.calcList.groups)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return
    const list = group.items.find((l) => l.id === listId)
    if (!list) return
    const rowMap = Object.fromEntries(list.rows.map((r) => [r.id, r]))
    const reindexed = orderedIds.map((id, i) => ({ ...rowMap[id], index: i + 1 })).filter(Boolean)
    const rest = list.rows.filter((r) => !orderedIds.includes(r.id))
    const updatedList = { ...list, rows: [...reindexed, ...rest], updatedAt: now() }
    const updated = {
      ...group,
      items: group.items.map((l) => (l.id === listId ? updatedList : l)),
      updatedAt: now(),
    }
    yield call(idb.saveList, updated)
    yield put(a.reorderRowsSuccess({ groupId, listId, rows: updatedList.rows }))
  } catch (e) {
    yield put(a.reorderRowsError(e.message))
    yield put(push({ type: 'error', message: e.message }))
  }
}

function* mergeGroups({ payload: remoteGroups }) {
  try {
    const local = yield select((s) => s.calcList.groups)
    const merged = [...local]
    for (const remote of remoteGroups) {
      const idx = merged.findIndex((g) => g.id === remote.id)
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

function* importGroups({ payload: importedGroups }) {
  try {
    const local = yield select((s) => s.calcList.groups)
    for (const g of local) yield call(idb.deleteList, g.id)
    for (const g of importedGroups) yield call(idb.saveList, g)
    yield put(a.importSuccess(importedGroups))
    yield put(push({ type: 'success', message: `${importedGroups.length} grupo(s) importados correctamente.` }))
  } catch (e) {
    yield put(a.importError(e.message))
    yield put(push({ type: 'error', message: `Error al importar: ${e.message}` }))
  }
}

export default function* sagaCalcList() {
  yield all([
    takeLatest(a.loadRequest, loadLists),
    takeEvery(a.createGroupRequest, createGroup),
    takeEvery(a.deleteGroupRequest, deleteGroup),
    takeEvery(a.updateGroupRequest, updateGroup),
    takeEvery(a.createListRequest, createList),
    takeEvery(a.deleteListRequest, deleteList),
    takeEvery(a.updateListRequest, updateList),
    takeEvery(a.saveRowRequest, saveRow),
    takeEvery(a.deleteRowRequest, deleteRow),
    takeEvery(a.reorderRowsRequest, reorderRows),
    takeEvery(a.mergeRequest, mergeGroups),
    takeEvery(a.importRequest, importGroups),
  ])
}
