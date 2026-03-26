import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/CashFlow/taxiAuditNoteActions'

const noteId = (date, driver) => `${date}__${driver.replace(/\s+/g, '_')}`

const taxiAuditNoteSlice = createSlice({
  name: 'taxiAuditNote',
  initialState: {
    notes: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.notes = payload.reduce((acc, n) => { acc[n.id] = n; return acc }, {})
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state) => { state.fetching = false; state.isError = true })
      .addCase(actions.successRequestUpsert, (state, { payload }) => {
        state.notes[payload.id] = payload
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        delete state.notes[noteId(payload.date, payload.driver)]
      })
  },
})

export default taxiAuditNoteSlice.reducer
