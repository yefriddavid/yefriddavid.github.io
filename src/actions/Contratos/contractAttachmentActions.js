import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contrato attachments')
export const beginRequestFetch = createAction('begin request fetch contrato attachments')
export const successRequestFetch = createAction('fetch contrato attachments success')
export const errorRequestFetch = createAction('request fetch contrato attachments error')

export const createRequest = createAction('request create contrato attachment')
export const beginRequestCreate = createAction('begin request create contrato attachment')
export const successRequestCreate = createAction('request create contrato attachment success')
export const errorRequestCreate = createAction('request create contrato attachment error')

export const deactivateRequest = createAction('request deactivate contrato attachment')
export const beginRequestDeactivate = createAction('begin request deactivate contrato attachment')
export const successRequestDeactivate = createAction('request deactivate contrato attachment success')
export const errorRequestDeactivate = createAction('request deactivate contrato attachment error')
