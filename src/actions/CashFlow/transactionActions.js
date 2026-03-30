import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch cashflow transactions')
export const beginRequestFetch = createAction('begin request fetch cashflow transactions')
export const successRequestFetch = createAction('fetch cashflow transactions success')
export const errorRequestFetch = createAction('request fetch cashflow transactions error')

export const createRequest = createAction('request create cashflow transaction')
export const beginRequestCreate = createAction('begin request create cashflow transaction')
export const successRequestCreate = createAction('request create cashflow transaction success')
export const errorRequestCreate = createAction('request create cashflow transaction error')

export const updateRequest = createAction('request update cashflow transaction')
export const beginRequestUpdate = createAction('begin request update cashflow transaction')
export const successRequestUpdate = createAction('request update cashflow transaction success')
export const errorRequestUpdate = createAction('request update cashflow transaction error')

export const deleteRequest = createAction('request delete cashflow transaction')
export const beginRequestDelete = createAction('begin request delete cashflow transaction')
export const successRequestDelete = createAction('request delete cashflow transaction success')
export const errorRequestDelete = createAction('request delete cashflow transaction error')

export const importRequest = createAction('request import cashflow transactions')
export const importProgressUpdate = createAction('import progress cashflow transactions')
export const importComplete = createAction('import complete cashflow transactions')
export const importError = createAction('import error cashflow transactions')
