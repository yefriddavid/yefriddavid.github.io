import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch taxi audit notes')
export const successRequestFetch = createAction('fetch taxi audit notes success')
export const errorRequestFetch = createAction('fetch taxi audit notes error')

export const upsertRequest = createAction('upsert taxi audit note')
export const successRequestUpsert = createAction('upsert taxi audit note success')
export const errorRequestUpsert = createAction('upsert taxi audit note error')

export const deleteRequest = createAction('delete taxi audit note')
export const successRequestDelete = createAction('delete taxi audit note success')
export const errorRequestDelete = createAction('delete taxi audit note error')
