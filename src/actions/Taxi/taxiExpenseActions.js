import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi expenses')
export const beginRequestFetch = createAction('begin request fetch taxi expenses')
export const successRequestFetch = createAction('fetch taxi expenses success')
export const errorRequestFetch = createAction('request fetch taxi expenses error')

export const createRequest = createAction('request create taxi expense')
export const beginRequestCreate = createAction('begin request create taxi expense')
export const successRequestCreate = createAction('request create taxi expense success')
export const errorRequestCreate = createAction('request create taxi expense error')

export const deleteRequest = createAction('request delete taxi expense')
export const beginRequestDelete = createAction('begin request delete taxi expense')
export const successRequestDelete = createAction('request delete taxi expense success')
export const errorRequestDelete = createAction('request delete taxi expense error')

export const togglePaidRequest = createAction('request toggle paid taxi expense')
export const successRequestTogglePaid = createAction('toggle paid taxi expense success')
export const errorRequestTogglePaid = createAction('toggle paid taxi expense error')
