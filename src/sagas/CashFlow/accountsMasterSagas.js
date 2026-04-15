import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/CashFlow/accountsMasterActions'
import * as service from '../../services/providers/firebase/CashFlow/accountsMaster'
import * as idb from '../../services/providers/indexeddb/CashFlow/accountsMaster'

function* fetchAccountsMaster() {
  try {
    yield put(actions.beginRequestFetch())

    // 1. Try to load from IndexedDB for immediate UI feedback
    const cachedData = yield call(idb.getAllAccounts)
    if (cachedData && cachedData.length > 0) {
      yield put(actions.successRequestFetch(cachedData))
    }

    // 2. Fetch fresh data from server
    const remoteData = yield call(service.getAccountsMaster)

    // 3. Update IndexedDB cache
    yield call(idb.storeLocalActiveAccounts, remoteData)

    // 4. Update store with latest data
    yield put(actions.successRequestFetch(remoteData))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* createAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.addAccountMaster, payload)
    const newAccount = { id, ...payload }

    // Sync local cache
    yield call(idb.saveAccount, newAccount)

    yield put(actions.successRequestCreate(newAccount))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

function* updateAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateAccountMaster, payload.id, payload)

    // Sync local cache
    yield call(idb.saveAccount, payload)

    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

function* deleteAccountMaster({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteAccountMaster, payload.id)

    // Sync local cache
    yield call(idb.deleteAccount, payload.id)

    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

function* seedAccountsMaster({ payload }) {
  try {
    const items = payload
    for (let i = 0; i < items.length; i++) {
      yield call(service.addAccountMaster, items[i])
      yield put(actions.seedProgressUpdate(Math.round(((i + 1) / items.length) * 100)))
    }
    const data = yield call(service.getAccountsMaster)

    // Update local cache
    yield call(idb.saveAccounts, data)

    yield put(actions.successRequestFetch(data))
    yield put(actions.seedComplete())
  } catch (e) {
    yield put(actions.seedError(e.message))
  }
}

// payload: [{ id, code, accountingName }, ...]
function* patchManyAccountsMaster({ payload }) {
  try {
    const items = payload
    for (let i = 0; i < items.length; i++) {
      const { id, ...fields } = items[i]
      yield call(service.updateAccountMaster, id, fields)
      yield put(actions.patchManyProgress(Math.round(((i + 1) / items.length) * 100)))
    }
    const data = yield call(service.getAccountsMaster)

    // Update local cache
    yield call(idb.saveAccounts, data)

    yield put(actions.successRequestFetch(data))
    yield put(actions.patchManyComplete())
  } catch (e) {
    yield put(actions.patchManyError(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAccountsMaster),
    takeLatest(actions.createRequest, createAccountMaster),
    takeLatest(actions.updateRequest, updateAccountMaster),
    takeLatest(actions.deleteRequest, deleteAccountMaster),
    takeLatest(actions.seedRequest, seedAccountsMaster),
    takeLatest(actions.patchManyRequest, patchManyAccountsMaster),
  ])
}
