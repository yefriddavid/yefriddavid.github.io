import { createCRUDActions } from 'src/utils/crudFactory'
import { createAction } from '@reduxjs/toolkit'

export const {
  fetchRequest,
  beginRequestFetch,
  successRequestFetch,
  errorRequestFetch,
  deleteRequest,
  beginRequestDelete,
  successRequestDelete,
  errorRequestDelete,
} = createCRUDActions('pageVisit')

export const trackVisitRequest = createAction('pageVisit/trackRequest')
