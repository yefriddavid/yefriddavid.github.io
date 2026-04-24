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
} = createCRUDActions('vehicleLocationHistory')

export const startLiveListener = createAction('vehicleLocationHistory/startLiveListener')
export const stopLiveListener = createAction('vehicleLocationHistory/stopLiveListener')
export const locationLiveUpdated = createAction('vehicleLocationHistory/locationLiveUpdated')
