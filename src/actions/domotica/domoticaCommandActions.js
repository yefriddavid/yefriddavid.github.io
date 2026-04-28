import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica commands')
export const fetchSuccess = createAction('fetch domotica commands success')
export const fetchError = createAction('fetch domotica commands error')

export const updateRequest = createAction('update domotica command')
export const updateSuccess = createAction('update domotica command success')
export const updateError = createAction('update domotica command error')
