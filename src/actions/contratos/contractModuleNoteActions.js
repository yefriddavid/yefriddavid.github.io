import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch contratos module notes')
export const successRequestFetch = createAction('fetch contratos module notes success')
export const errorRequestFetch = createAction('fetch contratos module notes error')

export const createRequest = createAction('create contratos module note')
export const successRequestCreate = createAction('create contratos module note success')
export const errorRequestCreate = createAction('create contratos module note error')

export const updateRequest = createAction('update contratos module note')
export const successRequestUpdate = createAction('update contratos module note success')
export const errorRequestUpdate = createAction('update contratos module note error')

export const deleteRequest = createAction('delete contratos module note')
export const successRequestDelete = createAction('delete contratos module note success')
export const errorRequestDelete = createAction('delete contratos module note error')
