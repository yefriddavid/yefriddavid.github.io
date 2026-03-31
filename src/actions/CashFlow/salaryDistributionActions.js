import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch salary distribution config')
export const beginRequestFetch = createAction('begin request fetch salary distribution config')
export const successRequestFetch = createAction('fetch salary distribution config success')
export const errorRequestFetch = createAction('request fetch salary distribution config error')

export const saveRequest = createAction('request save salary distribution config')
export const beginRequestSave = createAction('begin request save salary distribution config')
export const successRequestSave = createAction('request save salary distribution config success')
export const errorRequestSave = createAction('request save salary distribution config error')
