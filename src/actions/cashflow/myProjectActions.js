import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load my projects from idb')
export const loadSuccess = createAction('load my projects from idb success')
export const loadError = createAction('load my projects from idb error')

export const saveRequest = createAction('save my project to idb')
export const saveSuccess = createAction('save my project to idb success')
export const saveError = createAction('save my project to idb error')

export const deleteRequest = createAction('delete my project from idb')
export const deleteSuccess = createAction('delete my project from idb success')
export const deleteError = createAction('delete my project from idb error')
