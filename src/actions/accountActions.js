import { createAction } from 'redux-act'

// Crud
export const fetchData = createAction("fetch accounts")
export const beginRequest = createAction("begin request accounts")
export const errorRequest = createAction("account error request")
export const successRequest = createAction("request accounts success")



export const selectAccount = createAction("Select account")
export const appendVauchersToAccount = createAction("appendVaucherToPayment")
export const loadVauchersToAccountPayment = createAction("loadVauchersToAccountPayment")
export const selectVaucher = createAction("selectVaucher")

