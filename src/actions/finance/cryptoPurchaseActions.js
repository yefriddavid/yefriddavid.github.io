import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load crypto purchases')
export const loadSuccess = createAction('load crypto purchases success')
export const loadError = createAction('load crypto purchases error')

export const saveRequest = createAction('save crypto purchase')
export const saveSuccess = createAction('save crypto purchase success')
export const saveError = createAction('save crypto purchase error')

export const updateRequest = createAction('update crypto purchase')
export const updateSuccess = createAction('update crypto purchase success')
export const updateError = createAction('update crypto purchase error')

export const deleteRequest = createAction('delete crypto purchase')
export const deleteSuccess = createAction('delete crypto purchase success')
export const deleteError = createAction('delete crypto purchase error')
