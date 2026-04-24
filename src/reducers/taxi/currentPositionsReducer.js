import { createReducer } from '@reduxjs/toolkit'
import * as actions from 'src/actions/taxi/currentPositionsActions'

export default createReducer({}, (builder) => {
  builder
    .addCase(actions.updateFromWss, (state, { payload }) => {
      const { vehicleId, lat, lng, speed, lastUpdate } = payload
      state[vehicleId] = { lat, lng, speed, lastUpdate, source: 'wss' }
    })
    .addCase(actions.updateFromApp, (state, { payload }) => {
      const { vehicleId, lat, lng, lastUpdate } = payload
      const current = state[vehicleId]
      if (!current) {
        state[vehicleId] = { lat, lng, speed: 0, lastUpdate, source: 'app' }
        return
      }
      if (current.source === 'wss') return
      if (new Date(lastUpdate) > new Date(current.lastUpdate)) {
        state[vehicleId] = { lat, lng, speed: 0, lastUpdate, source: 'app' }
      }
    })
    .addCase(actions.resetAll, () => ({}))
})
