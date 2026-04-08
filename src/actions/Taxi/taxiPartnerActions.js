import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi partners')
export const beginRequestFetch = createAction('begin fetch taxi partners')
export const successRequestFetch = createAction('success fetch taxi partners')
export const errorRequestFetch = createAction('error fetch taxi partners')

export const createRequest = createAction('create taxi partner')
export const beginRequestCreate = createAction('begin create taxi partner')
export const successRequestCreate = createAction('success create taxi partner')
export const errorRequestCreate = createAction('error create taxi partner')

export const updateRequest = createAction('update taxi partner')
export const beginRequestUpdate = createAction('begin update taxi partner')
export const successRequestUpdate = createAction('success update taxi partner')
export const errorRequestUpdate = createAction('error update taxi partner')

export const deleteRequest = createAction('delete taxi partner')
export const beginRequestDelete = createAction('begin delete taxi partner')
export const successRequestDelete = createAction('success delete taxi partner')
export const errorRequestDelete = createAction('error delete taxi partner')
