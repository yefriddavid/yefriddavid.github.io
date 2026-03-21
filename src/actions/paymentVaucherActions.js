import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch vaucher payments')
export const beginRequestFetch = createAction('begin request fetch vaucher payments')
export const successRequestFetch = createAction('fetch vaucher payment success')
export const errorRequestFetch = createAction('request fetch vaucher payment error')

export const createRequest = createAction('request create vaucher payment')
export const beginRequestCreate = createAction('begin request create vaucher payment')
export const successRequestCreate = createAction('request create vaucher payment success')
export const errorRequestCreate = createAction('request create vaucher payment error')

export const deleteRequest = createAction('request delete vaucher payment')
export const beginRequestDelete = createAction('begin request delete vaucher payment')
export const successRequestDelete = createAction('request delete vaucher payment success')
export const errorRequestDelete = createAction('request delete vaucher payment success')
