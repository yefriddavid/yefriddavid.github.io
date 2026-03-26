import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi distributions')
export const beginRequestFetch = createAction('begin fetch taxi distributions')
export const successRequestFetch = createAction('success fetch taxi distributions')
export const errorRequestFetch = createAction('error fetch taxi distributions')

export const createRequest = createAction('create taxi distribution')
export const beginRequestCreate = createAction('begin create taxi distribution')
export const successRequestCreate = createAction('success create taxi distribution')
export const errorRequestCreate = createAction('error create taxi distribution')

export const updatePaymentRequest = createAction('update taxi distribution payment')
export const beginRequestUpdatePayment = createAction('begin update taxi distribution payment')
export const successRequestUpdatePayment = createAction('success update taxi distribution payment')
export const errorRequestUpdatePayment = createAction('error update taxi distribution payment')

export const deleteRequest = createAction('delete taxi distribution')
export const successRequestDelete = createAction('success delete taxi distribution')
export const errorRequestDelete = createAction('error delete taxi distribution')
