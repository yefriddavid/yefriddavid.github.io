import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contrato bank accounts')
export const beginRequestFetch = createAction('begin request fetch contrato bank accounts')
export const successRequestFetch = createAction('fetch contrato bank accounts success')
export const errorRequestFetch = createAction('request fetch contrato bank accounts error')

export const createRequest = createAction('request create contrato bank account')
export const beginRequestCreate = createAction('begin request create contrato bank account')
export const successRequestCreate = createAction('request create contrato bank account success')
export const errorRequestCreate = createAction('request create contrato bank account error')

export const updateRequest = createAction('request update contrato bank account')
export const beginRequestUpdate = createAction('begin request update contrato bank account')
export const successRequestUpdate = createAction('request update contrato bank account success')
export const errorRequestUpdate = createAction('request update contrato bank account error')

export const deleteRequest = createAction('request delete contrato bank account')
export const beginRequestDelete = createAction('begin request delete contrato bank account')
export const successRequestDelete = createAction('request delete contrato bank account success')
export const errorRequestDelete = createAction('request delete contrato bank account error')
