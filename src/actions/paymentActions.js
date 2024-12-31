import { createAction } from 'redux-act'

export const fetchRequest = createAction("fetch payments")
export const beginRequestFetch = createAction("begin request fetch payments")
//export const errorRequest = createAction("login error request")
//export const beginLoginRequest = createAction("login begin request")
export const successRequestFetch = createAction("fetch payment success")
export const errorRequestFetch = createAction("request fetch payment error")

export const createRequest = createAction("request create payment")
export const beginRequestCreate = createAction("begin request create payment")
export const successRequestCreate = createAction("request create payment success")
export const errorRequestCreate = createAction("request create payment error")


export const deleteRequest = createAction("request delete payment")
export const beginRequestDelete = createAction("begin request delete payment")
export const successRequestDelete = createAction("request delete payment success")
export const errorRequestDelete = createAction("request delete payment success")
