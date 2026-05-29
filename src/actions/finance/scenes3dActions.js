import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch finance scenes3d')
export const beginRequestFetch = createAction('begin fetch finance scenes3d')
export const successRequestFetch = createAction('success fetch finance scenes3d')
export const errorRequestFetch = createAction('error fetch finance scenes3d')

export const loadRequest = createAction('load finance scene3d')
export const beginRequestLoad = createAction('begin load finance scene3d')
export const successRequestLoad = createAction('success load finance scene3d')
export const errorRequestLoad = createAction('error load finance scene3d')

export const createRequest = createAction('create finance scene3d')
export const beginRequestCreate = createAction('begin create finance scene3d')
export const successRequestCreate = createAction('success create finance scene3d')
export const errorRequestCreate = createAction('error create finance scene3d')

export const updateRequest = createAction('update finance scene3d')
export const beginRequestUpdate = createAction('begin update finance scene3d')
export const successRequestUpdate = createAction('success update finance scene3d')
export const errorRequestUpdate = createAction('error update finance scene3d')

export const deleteRequest = createAction('delete finance scene3d')
export const beginRequestDelete = createAction('begin delete finance scene3d')
export const successRequestDelete = createAction('success delete finance scene3d')
export const errorRequestDelete = createAction('error delete finance scene3d')

export const clearScene = createAction('clear finance scene3d')
