import { createSlice } from '@reduxjs/toolkit'
import * as accountActions from '../actions/accountActions'
import { successRequestCreate, successRequestDelete } from '../actions/paymentActions'

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    error: null,
    fetching: false,
    data: null,
    isError: false,
    selectedAccount: null,
    selectedVaucher: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(accountActions.fetchData, (state, { payload }) => {
        state.data = null
        state.filters = payload
      })
      .addCase(accountActions.beginRequest, (state) => {
        state.fetching = true
      })
      .addCase(accountActions.successRequest, (state, { payload }) => {
        state.data = payload
        state.fetching = false
      })
      .addCase(accountActions.errorRequest, (state, { payload }) => {
        state.error = payload
        state.data = []
        state.fetching = false
        state.isError = true
      })
      .addCase(accountActions.selectAccount, (state, { payload }) => {
        state.selectedAccount = payload
      })
      .addCase(accountActions.selectVaucher, (state, { payload }) => {
        state.selectedVaucher = payload
      })
      .addCase(accountActions.appendVauchersToAccount, (state, { payload }) => {
        const items = state.data?.data?.items
        if (items) {
          const idx = items.findIndex((e) => e.accountId == payload.accountId)
          if (idx !== -1) {
            items[idx] = { ...payload, vaucherLoaded: true }
          }
        }
      })
      .addCase(successRequestCreate, (state) => {
        state.selectedAccount = null
      })
      .addCase(successRequestDelete, (state, { payload }) => {
        const items = state.data?.data?.items
        if (!items) return
        items.forEach((account) => {
          if (account.payments?.items) {
            account.payments.items = account.payments.items.filter(
              (p) => p.paymentId !== payload.paymentId,
            )
            account.payments.total = account.payments.items.reduce((sum, p) => sum + (p.value || 0), 0)
          }
        })
      })
  },
})

export default accountSlice.reducer
