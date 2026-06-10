import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load calc list')
export const loadSuccess = createAction('load calc list success')
export const loadError = createAction('load calc list error')

export const saveRequest = createAction('save calc list row')
export const saveSuccess = createAction('save calc list row success')
export const saveError = createAction('save calc list row error')

export const deleteRequest = createAction('delete calc list row')
export const deleteSuccess = createAction('delete calc list row success')
export const deleteError = createAction('delete calc list row error')
