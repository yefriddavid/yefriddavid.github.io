import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/taxi/taxiPeriodAttachmentActions'

const taxiPeriodAttachmentSlice = createSlice({
  name: 'taxiPeriodAttachment',
  initialState: {
    attachments: [],
    fetching: false,
    saving: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.successRequestFetch, (state, { payload }) => {
        state.attachments = payload
        state.fetching = false
      })
      .addCase(actions.errorRequestFetch, (state) => {
        state.fetching = false
        state.isError = true
      })

      .addCase(actions.createRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.attachments = [...state.attachments, payload]
        state.saving = false
      })
      .addCase(actions.errorRequestCreate, (state) => {
        state.saving = false
        state.isError = true
      })

      .addCase(actions.updateRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestUpdate, (state, { payload }) => {
        state.attachments = state.attachments.map((a) =>
          a.id === payload.id ? { ...a, ...payload } : a,
        )
        state.saving = false
      })
      .addCase(actions.errorRequestUpdate, (state) => {
        state.saving = false
        state.isError = true
      })

      .addCase(actions.deleteRequest, (state) => {
        state.saving = true
      })
      .addCase(actions.successRequestDelete, (state, { payload }) => {
        state.attachments = state.attachments.filter((a) => a.id !== payload.id)
        state.saving = false
      })
      .addCase(actions.errorRequestDelete, (state) => {
        state.saving = false
        state.isError = true
      })
  },
})

export default taxiPeriodAttachmentSlice.reducer
