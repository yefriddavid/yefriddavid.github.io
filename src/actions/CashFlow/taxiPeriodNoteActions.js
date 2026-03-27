import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi period notes')
export const successRequestFetch = createAction('fetch taxi period notes success')
export const errorRequestFetch = createAction('fetch taxi period notes error')

export const createRequest = createAction('create taxi period note')
export const successRequestCreate = createAction('create taxi period note success')
export const errorRequestCreate = createAction('create taxi period note error')

export const updateRequest = createAction('update taxi period note')
export const successRequestUpdate = createAction('update taxi period note success')
export const errorRequestUpdate = createAction('update taxi period note error')

export const deleteRequest = createAction('delete taxi period note')
export const successRequestDelete = createAction('delete taxi period note success')
export const errorRequestDelete = createAction('delete taxi period note error')
