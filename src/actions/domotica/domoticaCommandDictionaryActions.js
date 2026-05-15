import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica command dictionary')
export const beginRequestFetch = createAction('begin fetch domotica command dictionary')
export const successRequestFetch = createAction('fetch domotica command dictionary success')
export const errorRequestFetch = createAction('fetch domotica command dictionary error')

export const createRequest = createAction('create domotica command dictionary entry')
export const beginRequestCreate = createAction('begin create domotica command dictionary entry')
export const successRequestCreate = createAction('create domotica command dictionary entry success')
export const errorRequestCreate = createAction('create domotica command dictionary entry error')

export const updateRequest = createAction('update domotica command dictionary entry')
export const beginRequestUpdate = createAction('begin update domotica command dictionary entry')
export const successRequestUpdate = createAction('update domotica command dictionary entry success')
export const errorRequestUpdate = createAction('update domotica command dictionary entry error')

export const deleteRequest = createAction('delete domotica command dictionary entry')
export const beginRequestDelete = createAction('begin delete domotica command dictionary entry')
export const successRequestDelete = createAction('delete domotica command dictionary entry success')
export const errorRequestDelete = createAction('delete domotica command dictionary entry error')

export const seedRequest = createAction('seed domotica command dictionary')
export const beginRequestSeed = createAction('begin seed domotica command dictionary')
export const successRequestSeed = createAction('seed domotica command dictionary success')
export const errorRequestSeed = createAction('seed domotica command dictionary error')
