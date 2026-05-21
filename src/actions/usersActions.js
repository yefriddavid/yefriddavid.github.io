import { createAction } from '@reduxjs/toolkit'
import { createCRUDActions } from 'src/utils/crudFactory'

export const {
  fetchRequest,
  beginRequestFetch,
  successRequestFetch,
  errorRequestFetch,
  createRequest,
  beginRequestCreate,
  successRequestCreate,
  errorRequestCreate,
  updateRequest,
  beginRequestUpdate,
  successRequestUpdate,
  errorRequestUpdate,
  deleteRequest,
  beginRequestDelete,
  successRequestDelete,
  errorRequestDelete,
} = createCRUDActions('users')

export const fetchSessionsRequest = createAction('users/fetchSessionsRequest')
export const fetchSessionsSuccess = createAction('users/fetchSessionsSuccess')
export const fetchSessionsError = createAction('users/fetchSessionsError')
export const deleteSessionRequest = createAction('users/deleteSessionRequest')
export const deleteSessionSuccess = createAction('users/deleteSessionSuccess')
export const deleteSessionError = createAction('users/deleteSessionError')
export const deleteAllSessionsRequest = createAction('users/deleteAllSessionsRequest')
export const deleteAllSessionsSuccess = createAction('users/deleteAllSessionsSuccess')
export const deleteAllSessionsError = createAction('users/deleteAllSessionsError')

export const adminResetPasswordRequest = createAction('users/adminResetPasswordRequest')
export const adminResetPasswordSuccess = createAction('users/adminResetPasswordSuccess')
export const adminResetPasswordError = createAction('users/adminResetPasswordError')
