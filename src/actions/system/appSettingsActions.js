import { createCRUDActions } from 'src/utils/crudFactory'

export const {
  fetchRequest,
  beginRequestFetch,
  successRequestFetch,
  errorRequestFetch,
  updateRequest,
  successRequestUpdate,
  errorRequestUpdate,
} = createCRUDActions('appSettings')
