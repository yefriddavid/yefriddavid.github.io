import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/finance/cryptoWithdrawalActions'

const cryptoWithdrawalSlice = createSlice({
  name: 'cryptoWithdrawal',
  initialState: {
    withdrawals: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadRequest, (state) => {
        state.loading = true
      })
      .addCase(actions.loadSuccess, (state, { payload }) => {
        state.withdrawals = payload
        state.loading = false
      })
      .addCase(actions.loadError, (state, { payload }) => {
        state.error = payload
        state.loading = false
      })
  },
})

export default cryptoWithdrawalSlice.reducer
