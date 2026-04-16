import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch eggs')
export const beginRequestFetch = createAction('begin request fetch eggs')
export const successRequestFetch = createAction('fetch eggs success')
export const errorRequestFetch = createAction('fetch eggs error')

export const createRequest = createAction('create egg')
export const beginRequestCreate = createAction('begin request create egg')
export const successRequestCreate = createAction('create egg success')
export const errorRequestCreate = createAction('create egg error')

export const updateRequest = createAction('update egg')
export const successRequestUpdate = createAction('update egg success')
export const errorRequestUpdate = createAction('update egg error')

export const deleteRequest = createAction('delete egg')
export const beginRequestDelete = createAction('begin request delete egg')
export const successRequestDelete = createAction('delete egg success')
export const errorRequestDelete = createAction('delete egg error')
