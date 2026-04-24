import { createAction } from '@reduxjs/toolkit'

export const updateFromWss = createAction('currentPositions/updateFromWss')
export const updateFromApp = createAction('currentPositions/updateFromApp')
export const resetAll = createAction('currentPositions/resetAll')
