import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/inmobiliaria/designActions'

const designSlice = createSlice({
  name: 'inmobiliariaDesign',
  initialState: {
    list: null,
    current: null,
    selected: null,
    fetching: false,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.selectDesign, (state, { payload }) => {
        state.selected = payload
      })
      .addCase(actions.clearDesign, (state) => {
        state.selected = null
        state.current = null
      })

      .addCase(actions.beginRequestLoad, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(actions.successRequestLoad, (state, { payload }) => {
        state.current = payload
        state.loading = false
      })
      .addCase(actions.errorRequestLoad, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })

      .addCase(actions.beginRequestFetch, (state) => {
        state.fetching = true
        state.error = null
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.list = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
      })

      .addCase(actions.beginRequestCreate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.list = state.list
          ? [...state.list, payload].sort((a, b) => a.name.localeCompare(b.name))
          : [payload]
        state.selected = payload
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })

      .addCase(actions.beginRequestUpdate, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        state.list = state.list
          ? state.list.map((r) => (r.id === payload.id ? { ...r, ...payload } : r))
          : state.list
        state.selected = { ...state.selected, ...payload }
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })

      .addCase(actions.beginRequestClone, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestClone, (state, { payload }) => {
        state.list = state.list
          ? [...state.list, payload].sort((a, b) => a.name.localeCompare(b.name))
          : [payload]
        state.saving = false
      })
      .addCase(actions.errorRequestClone, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })

      .addCase(actions.beginRequestDelete, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        state.list = state.list ? state.list.filter((r) => r.id !== payload.id) : state.list
        if (state.selected?.id === payload.id) state.selected = null
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.saving = false
      })
  },
})

export default designSlice.reducer
