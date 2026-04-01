import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch salary distribution config')
export const beginRequestFetch = createAction('begin request fetch salary distribution config')
export const successRequestFetch = createAction('fetch salary distribution config success')
export const errorRequestFetch = createAction('request fetch salary distribution config error')

export const saveRequest = createAction('request save salary distribution config')
export const beginRequestSave = createAction('begin request save salary distribution config')
export const successRequestSave = createAction('request save salary distribution config success')
export const errorRequestSave = createAction('request save salary distribution config error')

export const syncRequest = createAction('request sync salary distribution to firebase')
export const syncSuccess = createAction('sync salary distribution to firebase success')
export const syncError = createAction('sync salary distribution to firebase error')

export const importRequest = createAction('request import salary distribution from firebase')
export const importSuccess = createAction('import salary distribution from firebase success')
export const importError = createAction('import salary distribution from firebase error')
