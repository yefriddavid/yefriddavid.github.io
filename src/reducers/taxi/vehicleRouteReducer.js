import { createReducer } from '@reduxjs/toolkit'
import * as actions from 'src/actions/taxi/vehicleRouteActions'

const initialState = { data: [], fetching: false, error: null }

export default createReducer(initialState, (builder) => {
  builder
    .addCase(actions.fetchRequest, (state) => {
      state.fetching = true
      state.error = null
      state.data = []
    })
    .addCase(actions.fetchSuccess, (state, { payload }) => {
      state.fetching = false
      state.data = payload
    })
    .addCase(actions.fetchError, (state, { payload }) => {
      state.fetching = false
      state.error = payload
    })
    .addCase(actions.clearRoute, (state) => {
      state.data = []
      state.error = null
    })
})
