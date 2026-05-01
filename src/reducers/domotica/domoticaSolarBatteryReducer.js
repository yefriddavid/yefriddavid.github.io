import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaSolarBatteryActions'

const domoticaSolarBatterySlice = createSlice({
  name: 'domoticaSolarBattery',
  initialState: {
    battery: null,
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.subscribeRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.dataReceived, (state, { payload }) => {
        state.battery = payload
        state.fetching = false
        state.isError = false
      })
      .addCase(actions.fetchError, (state) => {
        state.fetching = false
        state.isError = true
      })
      .addCase(actions.unsubscribeRequest, (state) => {
        state.fetching = false
      })
  },
})

export default domoticaSolarBatterySlice.reducer
