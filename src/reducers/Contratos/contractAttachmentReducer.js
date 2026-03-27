import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/Contratos/contractAttachmentActions'

const contractAttachmentSlice = createSlice({
  name: 'contratoAttachment',
  initialState: { data: [], fetching: false, saving: false, error: {}, isError: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.data = []
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
        state.data = [...state.data, payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.saving = false
        state.isError = true
      })

      .addCase(actions.successRequestDeactivate, (state, { payload }) => {
        state.data = state.data.filter((r) => r.id !== payload.id)
      })
      .addCase(actions.errorRequestDeactivate, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })
  },
})

export default contractAttachmentSlice.reducer
