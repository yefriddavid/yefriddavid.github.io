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
} = createCRUDActions('tenants')

export const assignUserRequest = createAction('tenants/assignUserRequest')
export const assignUserSuccess = createAction('tenants/assignUserSuccess')
export const assignUserError = createAction('tenants/assignUserError')
