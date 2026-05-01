import { createAction } from '@reduxjs/toolkit'

export const subscribeRequest = createAction('domotica solar battery subscribe')
export const unsubscribeRequest = createAction('domotica solar battery unsubscribe')
export const dataReceived = createAction('domotica solar battery data received')
export const fetchError = createAction('domotica solar battery error')
