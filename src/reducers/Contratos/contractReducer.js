import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/Contratos/contractActions'

const contractSlice = createSlice({
  name: 'contrato',
  initialState: {
    list: null,
    current: null,
    error: {},
    fetching: false,
    loading: false,
    saving: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.list = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })

      // Load single
      .addCase(actions.loadRequest, (state) => {
        state.loading = true
        state.isError = false
      })
      .addCase(actions.beginRequestLoad, (state) => {
        state.loading = true
      })
      .addCase(actions.successRequestLoad, (state, { payload }) => {
        state.current = payload
        state.loading = false
      })
      .addCase(actions.errorRequestLoad, (state, { payload }) => {
        state.error = payload
        state.loading = false
        state.isError = true
      })

      // Create
      .addCase(actions.beginRequestCreate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.list = state.list
          ? [...state.list, { id: payload.id, name: payload.name }].sort((a, b) =>
              a.name.localeCompare(b.name),
            )
          : [{ id: payload.id, name: payload.name }]
        state.current = payload
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      // Update
      .addCase(actions.beginRequestUpdate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        state.current = { ...state.current, ...payload }
        if (payload.name && state.list) {
          state.list = state.list
            .map((r) => (r.id === payload.id ? { ...r, name: payload.name } : r))
            .sort((a, b) => a.name.localeCompare(b.name))
        }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      // Clone
      .addCase(actions.beginRequestClone, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestClone, (state, { payload }) => {
        state.list = state.list
          ? [...state.list, { id: payload.id, name: payload.name }].sort((a, b) =>
              a.name.localeCompare(b.name),
            )
          : [{ id: payload.id, name: payload.name }]
        state.current = payload
        state.saving = false
      })
      .addCase(actions.errorRequestClone, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      // Delete
      .addCase(actions.beginRequestDelete, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.list) state.list = state.list.filter((r) => r.id !== payload.id)
        if (state.current?.id === payload.id) state.current = null
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })
  },
})

export default contractSlice.reducer
