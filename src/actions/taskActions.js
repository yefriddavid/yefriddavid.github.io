import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('task/fetchRequest')
export const successRequestFetch = createAction('task/fetchSuccess')
export const errorRequestFetch = createAction('task/fetchError')

export const saveRequest = createAction('task/saveRequest')
export const successRequestSave = createAction('task/saveSuccess')
export const errorRequestSave = createAction('task/saveError')

export const deleteRequest = createAction('task/deleteRequest')
export const successRequestDelete = createAction('task/deleteSuccess')
export const errorRequestDelete = createAction('task/deleteError')

export const syncPendingSuccess = createAction('task/syncPendingSuccess')
