import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaCommandDictionaryActions'

const domoticaCommandDictionarySlice = createSlice({
  name: 'domoticaCommandDictionary',
  initialState: {
    data: null,
    fetching: false,
    saving: false,
    seeding: false,
    isError: false,
    error: {},
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
          state.data = state.data.map((d) => (d.id === payload.id ? payload : d))
        }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.beginRequestDelete, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.filter((d) => d.id !== payload.id)
        }
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.beginRequestSeed, (state) => {
        state.seeding = true
      })
      .addCase(actions.successRequestSeed, (state, { payload }) => {
        state.data = payload
        state.seeding = false
      })
      .addCase(actions.errorRequestSeed, (state, { payload }) => {
        state.error = payload
        state.seeding = false
        state.isError = true
      })
  },
})

export default domoticaCommandDictionarySlice.reducer
