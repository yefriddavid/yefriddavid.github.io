import { put, call, all, takeLatest, fork } from 'redux-saga/effects'
import * as actions from 'src/actions/taxi/currentPositionsActions'
import { getLastKnownPosition } from 'src/services/firebase/taxi/vehicleLocationHistory'

function* fetchSinglePosition(vehicle) {
  try {
    const last = yield call(getLastKnownPosition, vehicle.id)
    if (last) {
      yield put(
        actions.updateFromApp({
          vehicleId: vehicle.id,
          lat: parseFloat(last.latitude),
          lng: parseFloat(last.longitude),
          lastUpdate: last.timestamp,
        }),
      )
    }
  } catch (_e) {
    // position simply won't appear on map
  }
}

export function* fetchLastKnownPositions({ payload: vehicles }) {
  yield all(vehicles.map((v) => fork(fetchSinglePosition, v)))
}

export default function* rootSagas() {
  yield all([takeLatest(actions.fetchLastKnownPositions, fetchLastKnownPositions)])
}
