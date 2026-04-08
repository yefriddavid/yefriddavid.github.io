import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi settlements')
export const beginRequestFetch = createAction('begin request fetch taxi settlements')
export const successRequestFetch = createAction('fetch taxi settlements success')
export const errorRequestFetch = createAction('request fetch taxi settlements error')

export const createRequest = createAction('request create taxi settlement')
export const beginRequestCreate = createAction('begin request create taxi settlement')
export const successRequestCreate = createAction('request create taxi settlement success')
export const errorRequestCreate = createAction('request create taxi settlement error')

export const updateRequest = createAction('request update taxi settlement')
export const beginRequestUpdate = createAction('begin request update taxi settlement')
export const successRequestUpdate = createAction('request update taxi settlement success')
export const errorRequestUpdate = createAction('request update taxi settlement error')

export const deleteRequest = createAction('request delete taxi settlement')
export const beginRequestDelete = createAction('begin request delete taxi settlement')
export const successRequestDelete = createAction('request delete taxi settlement success')
export const errorRequestDelete = createAction('request delete taxi settlement error')
