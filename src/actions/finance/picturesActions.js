import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch finance pictures')
export const beginRequestFetch = createAction('begin fetch finance pictures')
export const successRequestFetch = createAction('success fetch finance pictures')
export const errorRequestFetch = createAction('error fetch finance pictures')

export const loadRequest = createAction('load finance picture')
export const beginRequestLoad = createAction('begin load finance picture')
export const successRequestLoad = createAction('success load finance picture')
export const errorRequestLoad = createAction('error load finance picture')

export const createRequest = createAction('create finance picture')
export const beginRequestCreate = createAction('begin create finance picture')
export const successRequestCreate = createAction('success create finance picture')
export const errorRequestCreate = createAction('error create finance picture')

export const updateRequest = createAction('update finance picture')
export const beginRequestUpdate = createAction('begin update finance picture')
export const successRequestUpdate = createAction('success update finance picture')
export const errorRequestUpdate = createAction('error update finance picture')

export const deleteRequest = createAction('delete finance picture')
export const beginRequestDelete = createAction('begin delete finance picture')
export const successRequestDelete = createAction('success delete finance picture')
export const errorRequestDelete = createAction('error delete finance picture')

export const clearPicture = createAction('clear finance picture')
