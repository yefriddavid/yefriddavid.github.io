import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch account status period notes')
export const successRequestFetch = createAction('fetch account status period notes success')
export const errorRequestFetch = createAction('fetch account status period notes error')

export const createRequest = createAction('create account status period note')
export const successRequestCreate = createAction('create account status period note success')
export const errorRequestCreate = createAction('create account status period note error')

export const updateRequest = createAction('update account status period note')
export const successRequestUpdate = createAction('update account status period note success')
export const errorRequestUpdate = createAction('update account status period note error')

export const deleteRequest = createAction('delete account status period note')
export const successRequestDelete = createAction('delete account status period note success')
export const errorRequestDelete = createAction('delete account status period note error')
