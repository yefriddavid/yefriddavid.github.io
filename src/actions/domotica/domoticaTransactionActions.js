import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica transactions')
export const beginRequestFetch = createAction('begin request fetch domotica transactions')
export const successRequestFetch = createAction('fetch domotica transactions success')
export const errorRequestFetch = createAction('request fetch domotica transactions error')

export const createRequest = createAction('request create domotica transaction')
export const beginRequestCreate = createAction('begin request create domotica transaction')
export const successRequestCreate = createAction('request create domotica transaction success')
export const errorRequestCreate = createAction('request create domotica transaction error')

export const updateRequest = createAction('request update domotica transaction')
export const beginRequestUpdate = createAction('begin request update domotica transaction')
export const successRequestUpdate = createAction('request update domotica transaction success')
export const errorRequestUpdate = createAction('request update domotica transaction error')

export const deleteRequest = createAction('request delete domotica transaction')
export const beginRequestDelete = createAction('begin request delete domotica transaction')
export const successRequestDelete = createAction('request delete domotica transaction success')
export const errorRequestDelete = createAction('request delete domotica transaction error')

export const fetchVoltageRequest = createAction('fetch domotica voltage history')
export const fetchVoltageSuccess = createAction('fetch domotica voltage history success')
export const fetchVoltageError = createAction('fetch domotica voltage history error')

export const fetchCurrentRequest = createAction('fetch domotica current history')
export const fetchCurrentSuccess = createAction('fetch domotica current history success')
export const fetchCurrentError = createAction('fetch domotica current history error')
