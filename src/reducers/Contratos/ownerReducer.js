import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/Contratos/ownerActions'

const ownerSlice = createSlice({
  name: 'contratoOwner',
  initialState: { data: null, error: {}, fetching: false, saving: false, isError: false },
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
        state.data = state.data
          ? [...state.data, payload].sort((a, b) => a.full_name.localeCompare(b.full_name))
          : [payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        if (state.data) {
          state.data = state.data
            .map((r) => (r.id === payload.id ? { ...r, ...payload } : r))
            .sort((a, b) => a.full_name.localeCompare(b.full_name))
        }
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((r) => r.id !== payload.id)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })
  },
})

export default ownerSlice.reducer
