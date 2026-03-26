import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/taxiPartnerActions'

const taxiPartnerSlice = createSlice({
  name: 'taxiPartner',
  initialState: { data: null, error: {}, fetching: false, isError: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.beginRequestFetch, (state) => { state.fetching = true })
      .addCase(actions.successRequestFetch, (state, { payload }) => { state.data = payload; state.fetching = false })
      .addCase(actions.errorRequestFetch, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.beginRequestCreate, (state) => { state.fetching = true })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [...state.data, payload].sort((a, b) => a.name.localeCompare(b.name)) : [payload]
        state.fetching = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.beginRequestUpdate, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data
            .map((p) => p.id === payload.id ? { ...p, ...payload } : p)
            .sort((a, b) => a.name.localeCompare(b.name))
        }
        state.fetching = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((p) => p.id !== payload.id)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => { state.error = payload; state.isError = true })
  },
})

export default taxiPartnerSlice.reducer
