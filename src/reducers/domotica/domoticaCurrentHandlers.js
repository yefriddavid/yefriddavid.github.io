import * as actions from '../../actions/domotica/domoticaCurrentActions'

export const crudHandlers = (builder) => {
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
      state.fetching = true
    })
    .addCase(actions.successRequestCreate, (state, { payload }) => {
      state.data = state.data ? [payload, ...state.data] : [payload]
      state.fetching = false
    })
    .addCase(actions.errorRequestCreate, (state, { payload }) => {
      state.error = payload
      state.fetching = false
      state.isError = true
    })

    .addCase(actions.beginRequestUpdate, (state) => {
      state.fetching = true
    })
    .addCase(actions.successRequestUpdate, (state, { payload }) => {
      if (state.data) {
        state.data = state.data.map((r) => (r.id === payload.id ? payload : r))
      }
      state.fetching = false
    })
    .addCase(actions.errorRequestUpdate, (state, { payload }) => {
      state.error = payload
      state.fetching = false
      state.isError = true
    })

    .addCase(actions.beginRequestDelete, (state) => {
      state.fetching = true
    })
    .addCase(actions.successRequestDelete, (state, { payload }) => {
      if (state.data) {
        state.data = state.data.filter((r) => r.id !== payload.id)
      }
      state.fetching = false
    })
    .addCase(actions.errorRequestDelete, (state, { payload }) => {
      state.error = payload
      state.fetching = false
      state.isError = true
    })
}

export const statusHandlers = (builder) => {
  builder
    .addCase(actions.batteryStatusSuccess, (state, { payload }) => {
      state.battery = payload
    })
    .addCase(actions.consumptionStatusSuccess, (state, { payload }) => {
      state.consumption = payload
    })
}

export const manualReadHandlers = (builder) => {
  builder
    .addCase(actions.manualReadBegin, (state) => {
      state.manualReadState = 'loading'
    })
    .addCase(actions.manualReadSuccess, (state, { payload }) => {
      state.manualReadState = 'done'
      state.battery = payload
    })
    .addCase(actions.manualReadError, (state) => {
      state.manualReadState = 'error'
    })
    .addCase(actions.manualReadReset, (state) => {
      state.manualReadState = 'idle'
    })
}
