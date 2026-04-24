import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/vehicleLocationHistoryActions'

export default createCRUDReducer('vehicleLocationHistory', actions, {
  initialState: { liveLocations: {} },
  extraCases: (builder) => {
    builder.addCase(actions.locationLiveUpdated, (state, { payload }) => {
      const { vehicleId, lat, lng, timestamp } = payload
      const current = state.liveLocations[vehicleId]
      if (!current || !current.lastUpdate || new Date(timestamp) > new Date(current.lastUpdate)) {
        state.liveLocations[vehicleId] = { lat, lng, lastUpdate: timestamp, source: 'firebase' }
      }
    })
  },
}).reducer
