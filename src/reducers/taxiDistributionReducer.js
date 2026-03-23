import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../actions/taxiDistributionActions'

const taxiDistributionSlice = createSlice({
  name: 'taxiDistribution',
  initialState: { data: null, error: {}, fetching: false, isError: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.fetchRequest, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.beginRequestFetch, (state) => { state.fetching = true })
      .addCase(actions.successRequestFetch, (state, { payload }) => { state.data = payload; state.fetching = false })
      .addCase(actions.errorRequestFetch, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.beginRequestCreate, (state) => { state.fetching = true })
      .addCase(actions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [payload, ...state.data] : [payload]
        state.fetching = false
      })
      .addCase(actions.errorRequestCreate, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.beginRequestUpdatePayment, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.successRequestUpdatePayment, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((d) => {
            if (d.id !== payload.distributionId) return d
            return {
              ...d,
              payments: {
                ...d.payments,
                [payload.partnerId]: {
                  ...d.payments[payload.partnerId],
                  paidAmount: payload.paidAmount,
                  paidDate: payload.paidDate,
                  paid: true,
                },
              },
            }
          })
        }
        state.fetching = false
      })
      .addCase(actions.errorRequestUpdatePayment, (state, { payload }) => { state.error = payload; state.fetching = false; state.isError = true })

      .addCase(actions.successRequestDelete, (state, { payload }) => {
        if (state.data) state.data = state.data.filter((d) => d.id !== payload.id)
      })
      .addCase(actions.errorRequestDelete, (state, { payload }) => { state.error = payload; state.isError = true })
  },
})

export default taxiDistributionSlice.reducer
