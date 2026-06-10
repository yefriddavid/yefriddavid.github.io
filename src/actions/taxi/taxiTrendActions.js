import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('taxiTrend/fetchRequest')
export const clearRequest = createAction('taxiTrend/clearRequest')
export const beginRequestFetch = createAction('taxiTrend/beginFetch')
export const successRequestFetch = createAction('taxiTrend/fetchSuccess')
export const errorRequestFetch = createAction('taxiTrend/fetchError')
