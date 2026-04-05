import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/accountsMasterActions'

const accountsMasterSlice = createSlice({
  name: 'accountsMaster',
  initialState: {
    data: null,
    fetching: false,
    saving: false,
    error: {},
    isError: false,
    seeding: false,
    seedProgress: 0,
    patching: false,
    patchProgress: 0,
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
        state.saving = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [...state.data, payload] : [payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.beginRequestUpdate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((r) => (r.id === payload.id ? { ...r, ...payload } : r))
        }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((r) => r.id !== payload.id)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })

      .addCase(actions.seedRequest, (state) => {
        state.seeding = true
        state.seedProgress = 0
      })
      .addCase(actions.seedProgressUpdate, (state, { payload }) => {
        state.seedProgress = payload
      })
      .addCase(actions.seedComplete, (state) => {
        state.seeding = false
        state.seedProgress = 100
      })
      .addCase(actions.seedError, (state, { payload }) => {
        state.seeding = false
        state.error = payload
        state.isError = true
      })

      .addCase(actions.patchManyRequest, (state) => {
        state.patching = true
        state.patchProgress = 0
      })
      .addCase(actions.patchManyProgress, (state, { payload }) => {
        state.patchProgress = payload
      })
      .addCase(actions.patchManyComplete, (state) => {
        state.patching = false
        state.patchProgress = 100
      })
      .addCase(actions.patchManyError, (state, { payload }) => {
        state.patching = false
        state.error = payload
        state.isError = true
      })
  },
})

export default accountsMasterSlice.reducer
