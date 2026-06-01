import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load increase decrease entries')
export const loadSuccess = createAction('load increase decrease entries success')
export const loadError = createAction('load increase decrease entries error')

export const saveRequest = createAction('save increase decrease entry')
export const saveSuccess = createAction('save increase decrease entry success')
export const saveError = createAction('save increase decrease entry error')

export const deleteRequest = createAction('delete increase decrease entry')
export const deleteSuccess = createAction('delete increase decrease entry success')
export const deleteError = createAction('delete increase decrease entry error')
