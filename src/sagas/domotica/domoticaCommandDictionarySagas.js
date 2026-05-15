import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCommandDictionaryActions'
import * as service from '../../services/facade/domotica/domoticaCommandDictionaryFacade'

export function* fetchDictionary() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.fetchCommandDictionary)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

export function* createEntry({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(service.createCommandEntry, payload)
    yield put(actions.successRequestCreate({ id, ...payload, isCustom: true }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
  }
}

export function* updateEntry({ payload }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(service.updateCommandEntry, payload.id, payload)
    yield put(actions.successRequestUpdate(payload))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
  }
}

export function* deleteEntry({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(service.deleteCommandEntry, payload.id)
    yield put(actions.successRequestDelete(payload))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
  }
}

export function* seedDictionary({ payload }) {
  try {
    yield put(actions.beginRequestSeed())
    yield call(service.seedCommandDictionary, payload)
    const data = yield call(service.fetchCommandDictionary)
    yield put(actions.successRequestSeed(data))
  } catch (e) {
    yield put(actions.errorRequestSeed(e.message))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchDictionary),
    takeLatest(actions.createRequest, createEntry),
    takeLatest(actions.updateRequest, updateEntry),
    takeLatest(actions.deleteRequest, deleteEntry),
    takeLatest(actions.seedRequest, seedDictionary),
  ])
}
