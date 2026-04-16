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
} = createCRUDActions('taxiVehicle')

export const updateRestrictionsRequest = createAction('taxiVehicle/updateRestrictionsRequest')
export const successRequestUpdateRestrictions = createAction(
  'taxiVehicle/updateRestrictionsSuccess',
)
export const errorRequestUpdateRestrictions = createAction('taxiVehicle/updateRestrictionsError')
