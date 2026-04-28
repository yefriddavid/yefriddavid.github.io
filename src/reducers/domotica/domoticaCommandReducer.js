import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaCommandActions'

const domoticaCommandSlice = createSlice({
  name: 'domoticaCommand',
  initialState: {
    commands: {},
    fetching: false,
    updatingIds: {},
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(actions.fetchSuccess, (state, { payload }) => {
        state.commands = payload
        state.fetching = false
      })
      .addCase(actions.fetchError, (state) => {
        state.fetching = false
        state.isError = true
      })
      .addCase(actions.updateRequest, (state, { payload }) => {
        const { id, ...fields } = payload
        state.updatingIds[id] = true
        state.commands[id] = { ...(state.commands[id] ?? { id }), ...fields }
      })
      .addCase(actions.updateSuccess, (state, { payload }) => {
        delete state.updatingIds[payload.id]
      })
      .addCase(actions.updateError, (state, { payload }) => {
        delete state.updatingIds[payload.id]
      })
  },
})

export default domoticaCommandSlice.reducer
