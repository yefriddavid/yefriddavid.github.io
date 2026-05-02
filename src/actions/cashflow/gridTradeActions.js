import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load grid trades')
export const loadSuccess = createAction('load grid trades success')
export const loadError = createAction('load grid trades error')

export const saveRequest = createAction('save grid trade')
export const saveSuccess = createAction('save grid trade success')
export const saveError = createAction('save grid trade error')

export const deleteRequest = createAction('delete grid trade')
export const deleteSuccess = createAction('delete grid trade success')
export const deleteError = createAction('delete grid trade error')
