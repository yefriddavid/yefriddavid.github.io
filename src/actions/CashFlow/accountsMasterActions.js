import { createAction } from '@reduxjs/toolkit'
import { createCRUDActions } from 'src/utils/crudFactory'

export const {
  fetchRequest, beginRequestFetch, successRequestFetch, errorRequestFetch,
  createRequest, beginRequestCreate, successRequestCreate, errorRequestCreate,
  updateRequest, beginRequestUpdate, successRequestUpdate, errorRequestUpdate,
  deleteRequest, beginRequestDelete, successRequestDelete, errorRequestDelete,
} = createCRUDActions('accountsMaster')

export const seedRequest = createAction('accountsMaster/seedRequest')
export const seedProgressUpdate = createAction('accountsMaster/seedProgressUpdate')
export const seedComplete = createAction('accountsMaster/seedComplete')
export const seedError = createAction('accountsMaster/seedError')
export const patchManyRequest = createAction('accountsMaster/patchManyRequest')
export const patchManyProgress = createAction('accountsMaster/patchManyProgress')
export const patchManyComplete = createAction('accountsMaster/patchManyComplete')
export const patchManyError = createAction('accountsMaster/patchManyError')
