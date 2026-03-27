import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/taxiPeriodNoteActions'

const taxiPeriodNoteSlice = createSlice({
  name: 'taxiPeriodNote',
  initialState: {
    notes: [],
    fetching: false,
    saving: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.notes = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state) => { state.fetching = false; state.isError = true })

      .addCase(actions.createRequest, (state) => { state.saving = true })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.notes = [...state.notes, payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state) => { state.saving = false; state.isError = true })

      .addCase(actions.updateRequest, (state) => { state.saving = true })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        state.notes = state.notes.map((n) => n.id === payload.id ? { ...n, ...payload } : n)
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state) => { state.saving = false; state.isError = true })

      .addCase(actions.deleteRequest, (state) => { state.saving = true })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        state.notes = state.notes.filter((n) => n.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state) => { state.saving = false; state.isError = true })
  },
})

export default taxiPeriodNoteSlice.reducer
