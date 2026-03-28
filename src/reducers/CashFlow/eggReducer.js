import { createSlice } from '@reduxjs/toolkit'
import * as eggActions from '../../actions/CashFlow/eggActions'

const eggSlice = createSlice({
  name: 'egg',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    saving: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(eggActions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(eggActions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(eggActions.successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(eggActions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      .addCase(eggActions.beginRequestCreate, (state) => {
        state.saving = true
      })
      .addCase(eggActions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [payload, ...state.data] : [payload]
        state.saving = false
      })
      .addCase(eggActions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(eggActions.updateRequest, (state) => {
        state.saving = true
      })
      .addCase(eggActions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((e) => (e.id === payload.id ? { ...e, ...payload } : e))
        }
        state.saving = false
      })
      .addCase(eggActions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(eggActions.beginRequestDelete, (state) => {
        state.saving = true
      })
      .addCase(eggActions.successRequestDelete, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.filter((e) => e.id !== payload.id)
        }
        state.saving = false
      })
      .addCase(eggActions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })
  },
})

export default eggSlice.reducer
