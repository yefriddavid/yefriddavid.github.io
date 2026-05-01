import { put, call, take, fork, cancel, all, takeLatest } from 'redux-saga/effects'
import * as actions from '../../actions/domotica/domoticaSolarBatteryActions'
import { createSolarBatteryChannel } from '../../services/firebase/domotica/solarRtdb'

function* watchBatteryChannel() {
  const channel = yield call(createSolarBatteryChannel)
  try {
    while (true) {
      const { data, error } = yield take(channel)
      if (error) {
        yield put(actions.fetchError(error))
      } else {
        yield put(actions.dataReceived(data))
      }
    }
  } finally {
    channel.close()
  }
}

function* subscribeBattery() {
  const task = yield fork(watchBatteryChannel)
  yield take(actions.unsubscribeRequest)
  yield cancel(task)
}

export default function* rootSagas() {
  yield all([takeLatest(actions.subscribeRequest, subscribeBattery)])
}
