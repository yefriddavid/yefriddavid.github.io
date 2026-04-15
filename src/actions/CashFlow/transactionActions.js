import { createAction } from '@reduxjs/toolkit'
import { createCRUDActions } from 'src/utils/crudFactory'

export const {
  fetchRequest, beginRequestFetch, successRequestFetch, errorRequestFetch,
  createRequest, beginRequestCreate, successRequestCreate, errorRequestCreate,
  updateRequest, beginRequestUpdate, successRequestUpdate, errorRequestUpdate,
  deleteRequest, beginRequestDelete, successRequestDelete, errorRequestDelete,
} = createCRUDActions('transaction')

export const importRequest = createAction('transaction/importRequest')
export const importProgressUpdate = createAction('transaction/importProgressUpdate')
export const importComplete = createAction('transaction/importComplete')
export const importError = createAction('transaction/importError')
