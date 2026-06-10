import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load calc lists')
export const loadSuccess = createAction('load calc lists success')
export const loadError   = createAction('load calc lists error')

export const createListRequest = createAction('create calc list')
export const createListSuccess = createAction('create calc list success')
export const createListError   = createAction('create calc list error')

export const deleteListRequest = createAction('delete calc list')
export const deleteListSuccess = createAction('delete calc list success')
export const deleteListError   = createAction('delete calc list error')

export const renameListRequest = createAction('rename calc list')
export const renameListSuccess = createAction('rename calc list success')
export const renameListError   = createAction('rename calc list error')

// payload: id — local only, no IDB
export const setActive = createAction('set active calc list')

// payload: { listId, row }
export const saveRowRequest = createAction('save calc list row')
export const saveRowSuccess = createAction('save calc list row success')
export const saveRowError   = createAction('save calc list row error')

// payload: { listId, rowId }
export const deleteRowRequest = createAction('delete calc list row')
export const deleteRowSuccess = createAction('delete calc list row success')
export const deleteRowError   = createAction('delete calc list row error')

// payload: list[] from remote peer — merge into local IDB
export const mergeRequest = createAction('merge calc lists')
export const mergeSuccess = createAction('merge calc lists success')
export const mergeError   = createAction('merge calc lists error')
