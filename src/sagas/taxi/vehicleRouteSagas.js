import { put, call, all, takeLatest } from 'redux-saga/effects'
import * as actions from 'src/actions/taxi/vehicleRouteActions'
import { getHistoryByRange } from 'src/services/firebase/taxi/vehicleLocationHistory'

export function* fetchRoute({ payload }) {
  try {
    const { vehicleId, startDate, endDate } = payload
    const data = yield call(getHistoryByRange, vehicleId, startDate, endDate)
    yield put(actions.fetchSuccess(data))
  } catch (e) {
    yield put(actions.fetchError(e.message))
  }
}

export default function* rootSagas() {
  yield all([takeLatest(actions.fetchRequest, fetchRoute)])
}
