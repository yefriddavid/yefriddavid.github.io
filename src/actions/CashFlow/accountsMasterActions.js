import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch cashflow accounts master')
export const beginRequestFetch = createAction('begin request fetch cashflow accounts master')
export const successRequestFetch = createAction('fetch cashflow accounts master success')
export const errorRequestFetch = createAction('request fetch cashflow accounts master error')

export const createRequest = createAction('request create cashflow account master')
export const beginRequestCreate = createAction('begin request create cashflow account master')
export const successRequestCreate = createAction('request create cashflow account master success')
export const errorRequestCreate = createAction('request create cashflow account master error')

export const updateRequest = createAction('request update cashflow account master')
export const beginRequestUpdate = createAction('begin request update cashflow account master')
export const successRequestUpdate = createAction('request update cashflow account master success')
export const errorRequestUpdate = createAction('request update cashflow account master error')

export const deleteRequest = createAction('request delete cashflow account master')
export const beginRequestDelete = createAction('begin request delete cashflow account master')
export const successRequestDelete = createAction('request delete cashflow account master success')
export const errorRequestDelete = createAction('request delete cashflow account master error')

export const seedRequest = createAction('request seed cashflow accounts master')
export const seedProgressUpdate = createAction('seed progress cashflow accounts master')
export const seedComplete = createAction('seed complete cashflow accounts master')
export const seedError = createAction('seed error cashflow accounts master')

export const patchManyRequest = createAction('request patch many cashflow accounts master')
export const patchManyProgress = createAction('patch many progress cashflow accounts master')
export const patchManyComplete = createAction('patch many complete cashflow accounts master')
export const patchManyError = createAction('patch many error cashflow accounts master')
