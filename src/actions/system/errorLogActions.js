import { createCRUDActions } from 'src/utils/crudFactory'
import { createAction } from '@reduxjs/toolkit'

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
} = createCRUDActions('errorLog')

export const clearAllRequest = createAction('errorLog/clearAllRequest')
export const successRequestClearAll = createAction('errorLog/clearAllSuccess')
export const errorRequestClearAll = createAction('errorLog/clearAllError')
