import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load custom grid trades')
export const loadSuccess = createAction('load custom grid trades success')
export const loadError = createAction('load custom grid trades error')

export const saveRequest = createAction('save custom grid trade')
export const saveSuccess = createAction('save custom grid trade success')
export const saveError = createAction('save custom grid trade error')

export const deleteRequest = createAction('delete custom grid trade')
export const deleteSuccess = createAction('delete custom grid trade success')
export const deleteError = createAction('delete custom grid trade error')
