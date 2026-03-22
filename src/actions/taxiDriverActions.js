import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi drivers')
export const beginRequestFetch = createAction('begin request fetch taxi drivers')
export const successRequestFetch = createAction('fetch taxi drivers success')
export const errorRequestFetch = createAction('request fetch taxi drivers error')

export const createRequest = createAction('request create taxi driver')
export const beginRequestCreate = createAction('begin request create taxi driver')
export const successRequestCreate = createAction('request create taxi driver success')
export const errorRequestCreate = createAction('request create taxi driver error')

export const updateRequest = createAction('request update taxi driver')
export const beginRequestUpdate = createAction('begin request update taxi driver')
export const successRequestUpdate = createAction('request update taxi driver success')
export const errorRequestUpdate = createAction('request update taxi driver error')

export const deleteRequest = createAction('request delete taxi driver')
export const beginRequestDelete = createAction('begin request delete taxi driver')
export const successRequestDelete = createAction('request delete taxi driver success')
export const errorRequestDelete = createAction('request delete taxi driver error')
