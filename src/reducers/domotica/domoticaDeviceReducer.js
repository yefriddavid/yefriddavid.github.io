import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaDeviceActions'

const domoticaDeviceSlice = createSlice({
  name: 'domoticaDevice',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestCreate, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [...state.data, payload] : [payload]
        state.fetching = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestUpdate, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((d) => (d.id === payload.id ? payload : d))
        }
        state.fetching = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.beginRequestDelete, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.filter((d) => d.id !== payload.id)
        }
        state.fetching = false
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })
  },
})

export default domoticaDeviceSlice.reducer
