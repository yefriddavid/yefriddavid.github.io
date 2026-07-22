import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load crypto withdrawals')
export const loadSuccess = createAction('load crypto withdrawals success')
export const loadError = createAction('load crypto withdrawals error')
