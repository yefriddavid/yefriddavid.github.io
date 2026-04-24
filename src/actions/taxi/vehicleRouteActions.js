import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('vehicleRoute/fetchRequest')
export const fetchSuccess = createAction('vehicleRoute/fetchSuccess')
export const fetchError = createAction('vehicleRoute/fetchError')
export const clearRoute = createAction('vehicleRoute/clearRoute')
