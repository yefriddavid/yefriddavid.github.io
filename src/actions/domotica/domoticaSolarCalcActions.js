import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch domotica solar calc configs')
export const beginRequestFetch = createAction('begin request fetch domotica solar calc configs')
export const successRequestFetch = createAction('fetch domotica solar calc configs success')
export const errorRequestFetch = createAction('request fetch domotica solar calc configs error')

export const createRequest = createAction('request create domotica solar calc config')
export const beginRequestCreate = createAction('begin request create domotica solar calc config')
export const successRequestCreate = createAction('request create domotica solar calc config success')
export const errorRequestCreate = createAction('request create domotica solar calc config error')

export const updateRequest = createAction('request update domotica solar calc config')
export const beginRequestUpdate = createAction('begin request update domotica solar calc config')
export const successRequestUpdate = createAction('request update domotica solar calc config success')
export const errorRequestUpdate = createAction('request update domotica solar calc config error')

export const deleteRequest = createAction('request delete domotica solar calc config')
export const beginRequestDelete = createAction('begin request delete domotica solar calc config')
export const successRequestDelete = createAction('request delete domotica solar calc config success')
export const errorRequestDelete = createAction('request delete domotica solar calc config error')
