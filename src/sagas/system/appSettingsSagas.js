import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/system/appSettingsActions'
import * as service from '../../services/firebase/admin/appSettings'
import { SETTING_LABELS } from '../../constants/admin'
import { push as notify } from '../../reducers/notificationsSlice'

function* fetchAppSettings() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(service.getAppSettings)
    const keys = Object.keys(SETTING_LABELS)
    const map = Object.fromEntries(data.map((s) => [s.key, s]))
    const merged = keys.map((k) => map[k] ?? { key: k, value: '' })
    yield put(actions.successRequestFetch(merged))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
  }
}

function* updateAppSetting({ payload: { key, value } }) {
  try {
    yield call(service.setAppSetting, key, value)
    yield put(actions.successRequestUpdate({ key, value }))
    yield put(notify({ type: 'success', message: 'Variable guardada correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error al guardar: ${e.message}` }))
  }
}

export default function* rootSagas() {
  yield all([
    takeLatest(actions.fetchRequest, fetchAppSettings),
    takeLatest(actions.updateRequest, updateAppSetting),
  ])
}
