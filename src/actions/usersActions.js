import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch users')
export const beginRequestFetch = createAction('begin request fetch users')
export const successRequestFetch = createAction('fetch users success')
export const errorRequestFetch = createAction('request fetch users error')

export const createRequest = createAction('request create user')
export const beginRequestCreate = createAction('begin request create user')
export const successRequestCreate = createAction('request create user success')
export const errorRequestCreate = createAction('request create user error')

export const updateRequest = createAction('request update user')
export const beginRequestUpdate = createAction('begin request update user')
export const successRequestUpdate = createAction('request update user success')
export const errorRequestUpdate = createAction('request update user error')

export const deleteRequest = createAction('request delete user')
export const beginRequestDelete = createAction('begin request delete user')
export const successRequestDelete = createAction('request delete user success')
export const errorRequestDelete = createAction('request delete user error')
