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
