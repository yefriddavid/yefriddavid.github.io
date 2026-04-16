import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contract notes')
export const successRequestFetch = createAction('fetch contract notes success')
export const errorRequestFetch = createAction('fetch contract notes error')

export const createRequest = createAction('create contract note')
export const successRequestCreate = createAction('create contract note success')
export const errorRequestCreate = createAction('create contract note error')

export const updateRequest = createAction('update contract note')
export const successRequestUpdate = createAction('update contract note success')
export const errorRequestUpdate = createAction('update contract note error')

export const deleteRequest = createAction('delete contract note')
export const successRequestDelete = createAction('delete contract note success')
export const errorRequestDelete = createAction('delete contract note error')
