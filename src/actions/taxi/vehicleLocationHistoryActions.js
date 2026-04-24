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

// Per-vehicle recent history (last 5 positions, used in MapLocation accordion)
export const fetchRecentRequest = createAction('vehicleLocationHistory/fetchRecentRequest') // { vehicleId, plate }
export const fetchRecentSuccess = createAction('vehicleLocationHistory/fetchRecentSuccess') // { vehicleId, data }
export const fetchRecentError = createAction('vehicleLocationHistory/fetchRecentError')    // { vehicleId }
