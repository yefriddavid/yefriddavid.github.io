import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi vehicles')
export const beginRequestFetch = createAction('begin request fetch taxi vehicles')
export const successRequestFetch = createAction('fetch taxi vehicles success')
export const errorRequestFetch = createAction('request fetch taxi vehicles error')

export const createRequest = createAction('request create taxi vehicle')
export const beginRequestCreate = createAction('begin request create taxi vehicle')
export const successRequestCreate = createAction('request create taxi vehicle success')
export const errorRequestCreate = createAction('request create taxi vehicle error')

export const updateRequest = createAction('request update taxi vehicle')
export const beginRequestUpdate = createAction('begin request update taxi vehicle')
export const successRequestUpdate = createAction('request update taxi vehicle success')
export const errorRequestUpdate = createAction('request update taxi vehicle error')

export const deleteRequest = createAction('request delete taxi vehicle')
export const beginRequestDelete = createAction('begin request delete taxi vehicle')
export const successRequestDelete = createAction('request delete taxi vehicle success')
export const errorRequestDelete = createAction('request delete taxi vehicle error')

export const updateRestrictionsRequest = createAction('request update taxi vehicle restrictions')
export const successRequestUpdateRestrictions = createAction('request update taxi vehicle restrictions success')
export const errorRequestUpdateRestrictions = createAction('request update taxi vehicle restrictions error')
