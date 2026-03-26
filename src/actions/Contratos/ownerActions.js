import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contrato owners')
export const beginRequestFetch = createAction('begin request fetch contrato owners')
export const successRequestFetch = createAction('fetch contrato owners success')
export const errorRequestFetch = createAction('request fetch contrato owners error')

export const createRequest = createAction('request create contrato owner')
export const beginRequestCreate = createAction('begin request create contrato owner')
export const successRequestCreate = createAction('request create contrato owner success')
export const errorRequestCreate = createAction('request create contrato owner error')

export const updateRequest = createAction('request update contrato owner')
export const beginRequestUpdate = createAction('begin request update contrato owner')
export const successRequestUpdate = createAction('request update contrato owner success')
export const errorRequestUpdate = createAction('request update contrato owner error')

export const deleteRequest = createAction('request delete contrato owner')
export const beginRequestDelete = createAction('begin request delete contrato owner')
export const successRequestDelete = createAction('request delete contrato owner success')
export const errorRequestDelete = createAction('request delete contrato owner error')
