import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load loans')
export const loadSuccess = createAction('load loans success')
export const loadError = createAction('load loans error')

// payload: { id?, name, bank, principal, rate, rateMode, periods, method, safetyFee }
export const saveRequest = createAction('save loan')
export const saveSuccess = createAction('save loan success')
export const saveError = createAction('save loan error')

// payload: id
export const deleteRequest = createAction('delete loan')
export const deleteSuccess = createAction('delete loan success')
export const deleteError = createAction('delete loan error')
