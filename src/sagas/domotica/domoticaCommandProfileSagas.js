import { put, call, all, takeLatest, takeEvery } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaCommandProfileActions'
import * as service from '../../services/facade/domotica/domoticaCommandProfilesFacade'

function* fetchProfiles() {
  try {
    yield put(actions.beginFetchProfiles())
    const data = yield call(service.fetchProfiles)
    yield put(actions.successFetchProfiles(data))
  } catch (e) {
    yield put(actions.errorFetchProfiles(e.message))
  }
}

function* createProfile({ payload }) {
  try {
    yield put(actions.beginCreateProfile())
    const id = yield call(service.createProfile, payload)
    yield put(actions.successCreateProfile({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorCreateProfile(e.message))
  }
}

function* updateProfile({ payload }) {
  try {
    yield put(actions.beginUpdateProfile())
    yield call(service.updateProfile, payload.id, payload)
    yield put(actions.successUpdateProfile(payload))
  } catch (e) {
    yield put(actions.errorUpdateProfile(e.message))
  }
}

function* deleteProfile({ payload }) {
  try {
    yield put(actions.beginDeleteProfile())
    yield call(service.deleteProfile, payload.id)
    yield put(actions.successDeleteProfile(payload))
  } catch (e) {
    yield put(actions.errorDeleteProfile(e.message))
  }
}

function* fetchItems({ payload }) {
  const { profileId } = payload
  try {
    const data = yield call(service.fetchProfileItems, profileId)
    yield put(actions.successFetchItems({ profileId, data }))
  } catch (e) {
    yield put(actions.errorFetchItems({ profileId }))
  }
}

function* createItem({ payload }) {
  try {
    yield put(actions.beginCreateItem())
    const id = yield call(service.createProfileItem, payload)
    yield put(actions.successCreateItem({ id, ...payload }))
  } catch (e) {
    yield put(actions.errorCreateItem(e.message))
  }
}

function* updateItem({ payload }) {
  try {
    yield call(service.updateProfileItem, payload.id, payload)
    yield put(actions.successUpdateItem(payload))
  } catch (e) {
    yield put(actions.errorUpdateItem(e.message))
  }
}

function* deleteItem({ payload }) {
  try {
    yield call(service.deleteProfileItem, payload.id)
    yield put(actions.successDeleteItem(payload))
  } catch (e) {
    yield put(actions.errorDeleteItem(e.message))
  }
}

function* reorderItems({ payload }) {
  try {
    yield call(service.reorderProfileItems, payload.items)
    yield put(actions.successReorderItems(payload))
  } catch (e) {
    // silent fail on reorder — UI already shows the new order optimistically
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchProfilesRequest, fetchProfiles),
    takeLatest(actions.createProfileRequest, createProfile),
    takeLatest(actions.updateProfileRequest, updateProfile),
    takeLatest(actions.deleteProfileRequest, deleteProfile),
    takeEvery(actions.fetchItemsRequest, fetchItems),
    takeLatest(actions.createItemRequest, createItem),
    takeLatest(actions.updateItemRequest, updateItem),
    takeLatest(actions.deleteItemRequest, deleteItem),
    takeLatest(actions.reorderItemsRequest, reorderItems),
  ])
}
