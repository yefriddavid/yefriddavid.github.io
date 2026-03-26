import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contrato properties')
export const beginRequestFetch = createAction('begin request fetch contrato properties')
export const successRequestFetch = createAction('fetch contrato properties success')
export const errorRequestFetch = createAction('request fetch contrato properties error')

export const createRequest = createAction('request create contrato property')
export const beginRequestCreate = createAction('begin request create contrato property')
export const successRequestCreate = createAction('request create contrato property success')
export const errorRequestCreate = createAction('request create contrato property error')

export const updateRequest = createAction('request update contrato property')
export const beginRequestUpdate = createAction('begin request update contrato property')
export const successRequestUpdate = createAction('request update contrato property success')
export const errorRequestUpdate = createAction('request update contrato property error')

export const deleteRequest = createAction('request delete contrato property')
export const beginRequestDelete = createAction('begin request delete contrato property')
export const successRequestDelete = createAction('request delete contrato property success')
export const errorRequestDelete = createAction('request delete contrato property error')
