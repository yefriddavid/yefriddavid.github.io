import { createAction, createSlice } from '@reduxjs/toolkit'

export const createCRUDActions = (entity) => ({
  fetchRequest: createAction(`${entity}/fetchRequest`),
  beginRequestFetch: createAction(`${entity}/beginFetch`),
  successRequestFetch: createAction(`${entity}/fetchSuccess`),
  errorRequestFetch: createAction(`${entity}/fetchError`),
  createRequest: createAction(`${entity}/createRequest`),
  beginRequestCreate: createAction(`${entity}/beginCreate`),
  successRequestCreate: createAction(`${entity}/createSuccess`),
  errorRequestCreate: createAction(`${entity}/createError`),
  updateRequest: createAction(`${entity}/updateRequest`),
  beginRequestUpdate: createAction(`${entity}/beginUpdate`),
  successRequestUpdate: createAction(`${entity}/updateSuccess`),
  errorRequestUpdate: createAction(`${entity}/updateError`),
  deleteRequest: createAction(`${entity}/deleteRequest`),
  beginRequestDelete: createAction(`${entity}/beginDelete`),
  successRequestDelete: createAction(`${entity}/deleteSuccess`),
  errorRequestDelete: createAction(`${entity}/deleteError`),
})

/**
 * @param {string} sliceName
 * @param {object} actions - result of createCRUDActions (or superset)
 * @param {object} options
 * @param {string|null} options.sortKey       - field to sort by on create/update (null = insertion order)
 * @param {'fetching'|'saving'} options.writeFlag - state flag toggled during writes
 * @param {string} options.idKey              - field used to match records on update/delete
 * @param {boolean} options.prependOnCreate   - insert new record at head instead of tail
 * @param {boolean} options.beginUpdate       - handle beginRequestUpdate in reducer
 * @param {boolean} options.beginDelete       - handle beginRequestDelete in reducer
 * @param {object} options.initialState       - merged into the default initial state
 * @param {function|null} options.extraCases  - (builder) => void for additional addCase calls
 */
export const createCRUDReducer = (
  sliceName,
  actions,
  {
    sortKey = null,
    writeFlag = 'fetching',
    idKey = 'id',
    prependOnCreate = false,
    beginUpdate = false,
    beginDelete = false,
    initialState: extra = {},
    extraCases = null,
  } = {},
) => {
  const sortFn = sortKey
    ? (arr) => [...arr].sort((a, b) => (a[sortKey] ?? '').localeCompare(b[sortKey] ?? ''))
    : null

  const addToData = (data, item) => {
    const arr = data ? (prependOnCreate ? [item, ...data] : [...data, item]) : [item]
    return sortFn ? sortFn(arr) : arr
  }

  return createSlice({
    name: sliceName,
    initialState: {
      data: null,
      error: {},
      fetching: false,
      isError: false,
      ...(writeFlag === 'saving' ? { saving: false } : {}),
      ...extra,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(actions.fetchRequest, (s) => {
          s.fetching = true
          s.isError = false
        })
        .addCase(actions.beginRequestFetch, (s) => {
          s.fetching = true
        })
        .addCase(actions.successRequestFetch, (s, { payload }) => {
          s.data = payload
          s.fetching = false
        })
        .addCase(actions.errorRequestFetch, (s, { payload }) => {
          s.error = payload
          s.fetching = false
          s.isError = true
        })

        .addCase(actions.beginRequestCreate, (s) => {
          s[writeFlag] = true
        })
        .addCase(actions.successRequestCreate, (s, { payload }) => {
          s.data = addToData(s.data, payload)
          s[writeFlag] = false
        })
        .addCase(actions.errorRequestCreate, (s, { payload }) => {
          s.error = payload
          s[writeFlag] = false
          s.isError = true
        })

      if (beginUpdate) {
        builder.addCase(actions.beginRequestUpdate, (s) => {
          s[writeFlag] = true
          s.isError = false
        })
      }

      builder
        .addCase(actions.successRequestUpdate, (s, { payload }) => {
          if (s.data) {
            const mapped = s.data.map((r) =>
              r[idKey] === payload[idKey] ? { ...r, ...payload } : r,
            )
            s.data = sortFn ? sortFn(mapped) : mapped
          }
          if (beginUpdate) s[writeFlag] = false
        })
        .addCase(actions.errorRequestUpdate, (s, { payload }) => {
          s.error = payload
          if (beginUpdate) s[writeFlag] = false
          s.isError = true
        })

      if (beginDelete) {
        builder.addCase(actions.beginRequestDelete, (s) => {
          s[writeFlag] = true
        })
      }

      builder
        .addCase(actions.successRequestDelete, (s, { payload }) => {
          if (s.data) s.data = s.data.filter((r) => r[idKey] !== payload[idKey])
          if (beginDelete) s[writeFlag] = false
        })
        .addCase(actions.errorRequestDelete, (s, { payload }) => {
          s.error = payload
          if (beginDelete) s[writeFlag] = false
          s.isError = true
        })

      if (extraCases) extraCases(builder)
    },
  })
}
