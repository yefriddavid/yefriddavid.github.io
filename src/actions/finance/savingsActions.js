import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load savings')
export const loadSuccess = createAction('load savings success')
export const loadError = createAction('load savings error')

export const saveRequest = createAction('save saving')
export const saveSuccess = createAction('save saving success')
export const saveError = createAction('save saving error')

export const updateRequest = createAction('update saving')
export const updateSuccess = createAction('update saving success')
export const updateError = createAction('update saving error')

export const deleteRequest = createAction('delete saving')
export const deleteSuccess = createAction('delete saving success')
export const deleteError = createAction('delete saving error')
