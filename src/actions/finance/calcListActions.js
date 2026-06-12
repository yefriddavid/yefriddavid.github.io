import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load calc lists')
export const loadSuccess = createAction('load calc lists success')
export const loadError   = createAction('load calc lists error')

// Groups — payload: name (string)
export const createGroupRequest = createAction('create calc list group')
export const createGroupSuccess = createAction('create calc list group success')
export const createGroupError   = createAction('create calc list group error')

// payload: id
export const deleteGroupRequest = createAction('delete calc list group')
export const deleteGroupSuccess = createAction('delete calc list group success')
export const deleteGroupError   = createAction('delete calc list group error')

// payload: { id, name, order? }
export const updateGroupRequest = createAction('update calc list group')
export const updateGroupSuccess = createAction('update calc list group success')
export const updateGroupError   = createAction('update calc list group error')

// payload: id — local only
export const setActiveGroup = createAction('set active calc list group')

// payload: id — deep clone with new IDs
export const cloneGroupRequest = createAction('clone calc list group')
export const cloneGroupSuccess = createAction('clone calc list group success')
export const cloneGroupError   = createAction('clone calc list group error')

// Lists — payload: { groupId, name }
export const createListRequest = createAction('create calc list')
export const createListSuccess = createAction('create calc list success')
export const createListError   = createAction('create calc list error')

// payload: { groupId, listId }
export const deleteListRequest = createAction('delete calc list')
export const deleteListSuccess = createAction('delete calc list success')
export const deleteListError   = createAction('delete calc list error')

// payload: { groupId, id, name, budget?, order? }
export const updateListRequest = createAction('update calc list')
export const updateListSuccess = createAction('update calc list success')
export const updateListError   = createAction('update calc list error')

// payload: id — local only
export const setActive = createAction('set active calc list')

// payload: { groupId, listId, row }
export const saveRowRequest = createAction('save calc list row')
export const saveRowSuccess = createAction('save calc list row success')
export const saveRowError   = createAction('save calc list row error')

// payload: { groupId, listId, rowId }
export const deleteRowRequest = createAction('delete calc list row')
export const deleteRowSuccess = createAction('delete calc list row success')
export const deleteRowError   = createAction('delete calc list row error')

// payload: { groupId, listId, orderedIds } — atomic reindex in one IDB write
export const reorderRowsRequest = createAction('reorder calc list rows')
export const reorderRowsSuccess = createAction('reorder calc list rows success')
export const reorderRowsError   = createAction('reorder calc list rows error')

// payload: group[] from remote peer — merge into local IDB
export const mergeRequest = createAction('merge calc lists')
export const mergeSuccess = createAction('merge calc lists success')
export const mergeError   = createAction('merge calc lists error')

// payload: group[] from JSON file — fully replaces local IDB
export const importRequest = createAction('import calc lists')
export const importSuccess = createAction('import calc lists success')
export const importError   = createAction('import calc lists error')
