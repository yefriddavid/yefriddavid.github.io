import { createSlice } from '@reduxjs/toolkit'
import { successRequestCreate as paymentSuccessRequestCreate } from '../actions/paymentActions'
import * as paymentVaucherActions from '../actions/paymentVaucherActions'

const paymentVaucherSlice = createSlice({
  name: 'paymentVaucher',
  initialState: {
    data: null,
    error: {},
    fetching: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(paymentSuccessRequestCreate, (state, { payload }) => {
        state.filters = payload
      })
      .addCase(paymentVaucherActions.beginRequestCreate, (state) => {
        state.fetching = true
      })
      .addCase(paymentVaucherActions.successRequestCreate, (state) => {
        state.fetching = false
      })
      .addCase(paymentVaucherActions.errorRequestCreate, (state, { payload }) => {
        state.error = payload
        state.fetching = false
        state.isError = true
      })
  },
})

export default paymentVaucherSlice.reducer
