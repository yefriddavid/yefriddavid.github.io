import { createCRUDReducer } from 'src/utils/crudFactory'
import * as actions from '../../actions/taxi/vehicleLocationHistoryActions'

export default createCRUDReducer('vehicleLocationHistory', actions, {
  initialState: { recentHistories: {}, loadingHistories: {} },
  extraCases: (builder) => {
    builder
      .addCase(actions.fetchRecentRequest, (state, { payload }) => {
        state.loadingHistories[payload.vehicleId] = true
      })
      .addCase(actions.fetchRecentSuccess, (state, { payload }) => {
        state.recentHistories[payload.vehicleId] = payload.data
        state.loadingHistories[payload.vehicleId] = false
      })
      .addCase(actions.fetchRecentError, (state, { payload }) => {
        state.loadingHistories[payload.vehicleId] = false
      })
  },
}).reducer
