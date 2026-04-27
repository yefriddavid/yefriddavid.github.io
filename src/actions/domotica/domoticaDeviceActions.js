import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica devices')
export const beginRequestFetch = createAction('begin request fetch domotica devices')
export const successRequestFetch = createAction('fetch domotica devices success')
export const errorRequestFetch = createAction('request fetch domotica devices error')

export const createRequest = createAction('request create domotica device')
export const beginRequestCreate = createAction('begin request create domotica device')
export const successRequestCreate = createAction('request create domotica device success')
export const errorRequestCreate = createAction('request create domotica device error')

export const updateRequest = createAction('request update domotica device')
export const beginRequestUpdate = createAction('begin request update domotica device')
export const successRequestUpdate = createAction('request update domotica device success')
export const errorRequestUpdate = createAction('request update domotica device error')

export const deleteRequest = createAction('request delete domotica device')
export const beginRequestDelete = createAction('begin request delete domotica device')
export const successRequestDelete = createAction('request delete domotica device success')
export const errorRequestDelete = createAction('request delete domotica device error')
