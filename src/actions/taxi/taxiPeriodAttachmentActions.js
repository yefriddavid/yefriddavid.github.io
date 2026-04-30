import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi period attachments')
export const successRequestFetch = createAction('fetch taxi period attachments success')
export const errorRequestFetch = createAction('fetch taxi period attachments error')

export const createRequest = createAction('create taxi period attachment')
export const successRequestCreate = createAction('create taxi period attachment success')
export const errorRequestCreate = createAction('create taxi period attachment error')

export const updateRequest = createAction('update taxi period attachment')
export const successRequestUpdate = createAction('update taxi period attachment success')
export const errorRequestUpdate = createAction('update taxi period attachment error')

export const deleteRequest = createAction('delete taxi period attachment')
export const successRequestDelete = createAction('delete taxi period attachment success')
export const errorRequestDelete = createAction('delete taxi period attachment error')
