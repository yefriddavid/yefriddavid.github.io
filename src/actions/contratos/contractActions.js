import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contratos list')
export const beginRequestFetch = createAction('begin request fetch contratos list')
export const successRequestFetch = createAction('fetch contratos list success')
export const errorRequestFetch = createAction('request fetch contratos list error')

export const loadRequest = createAction('request load contrato')
export const beginRequestLoad = createAction('begin request load contrato')
export const successRequestLoad = createAction('request load contrato success')
export const errorRequestLoad = createAction('request load contrato error')

export const createRequest = createAction('request create contrato')
export const beginRequestCreate = createAction('begin request create contrato')
export const successRequestCreate = createAction('request create contrato success')
export const errorRequestCreate = createAction('request create contrato error')

export const updateRequest = createAction('request update contrato')
export const beginRequestUpdate = createAction('begin request update contrato')
export const successRequestUpdate = createAction('request update contrato success')
export const errorRequestUpdate = createAction('request update contrato error')

export const cloneRequest = createAction('request clone contrato')
export const beginRequestClone = createAction('begin request clone contrato')
export const successRequestClone = createAction('request clone contrato success')
export const errorRequestClone = createAction('request clone contrato error')

export const deleteRequest = createAction('request delete contrato')
export const beginRequestDelete = createAction('begin request delete contrato')
export const successRequestDelete = createAction('request delete contrato success')
export const errorRequestDelete = createAction('request delete contrato error')
