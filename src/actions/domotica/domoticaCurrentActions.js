import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica current')
export const beginRequestFetch = createAction('begin request fetch domotica current')
export const successRequestFetch = createAction('fetch domotica current success')
export const errorRequestFetch = createAction('request fetch domotica current error')

export const createRequest = createAction('request create domotica current')
export const beginRequestCreate = createAction('begin request create domotica current')
export const successRequestCreate = createAction('request create domotica current success')
export const errorRequestCreate = createAction('request create domotica current error')

export const updateRequest = createAction('request update domotica current')
export const beginRequestUpdate = createAction('begin request update domotica current')
export const successRequestUpdate = createAction('request update domotica current success')
export const errorRequestUpdate = createAction('request update domotica current error')

export const deleteRequest = createAction('request delete domotica current')
export const beginRequestDelete = createAction('begin request delete domotica current')
export const successRequestDelete = createAction('request delete domotica current success')
export const errorRequestDelete = createAction('request delete domotica current error')

// Battery & Consumption Status (Polling)
export const batteryStatusRequest = createAction('domotica battery status request')
export const batteryStatusSuccess = createAction('domotica battery status success')

export const consumptionStatusRequest = createAction('domotica consumption status request')
export const consumptionStatusSuccess = createAction('domotica consumption status success')

// Manual Read
export const manualReadRequest = createAction('domotica manual read request')
export const manualReadBegin = createAction('domotica manual read begin')
export const manualReadSuccess = createAction('domotica manual read success')
export const manualReadError = createAction('domotica manual read error')
export const manualReadReset = createAction('domotica manual read reset')
