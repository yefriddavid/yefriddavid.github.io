import { createSlice } from '@reduxjs/toolkit'
import * as taxiExpenseActions from '../../actions/taxi/taxiExpenseActions'

const taxiExpenseSlice = createSlice({
  name: 'taxiExpense',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(taxiExpenseActions.fetchRequest, (state) => {
        state.fetching = true
        state.isError = false
      })
      .addCase(taxiExpenseActions.beginRequestFetch, (state) => {
        state.fetching = true
      })
      .addCase(taxiExpenseActions.successRequestFetch, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(taxiExpenseActions.errorRequestFetch, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })
      .addCase(taxiExpenseActions.beginRequestCreate, (state) => {
        state.fetching = true
      })
      .addCase(taxiExpenseActions.successRequestCreate, (state, { payload }) => {
        state.data = state.data ? [payload, ...state.data] : [payload]
        state.fetching = false
      })
      .addCase(taxiExpenseActions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })
      .addCase(taxiExpenseActions.beginRequestDelete, (state) => {
        state.fetching = false
      })
      .addCase(taxiExpenseActions.successRequestDelete, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.filter((e) => e.id !== payload.id)
        }
      })
      .addCase(taxiExpenseActions.errorRequestDelete, (state, { payload }) => {
        state.error = payload
        state.isError = true
      })
      .addCase(taxiExpenseActions.successRequestTogglePaid, (state, { payload }) => {
        if (state.data) {
          state.data = state.data.map((e) =>
            e.id === payload.id ? { ...e, paid: payload.paid } : e,
          )
        }
      })
  },
})

export default taxiExpenseSlice.reducer
