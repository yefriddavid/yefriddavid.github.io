import { createAction } from '@reduxjs/toolkit'

export const fetchRequest  = createAction('fetch finance picture versions')
export const beginFetch    = createAction('begin fetch finance picture versions')
export const successFetch  = createAction('success fetch finance picture versions')
export const errorFetch    = createAction('error fetch finance picture versions')

export const createRequest  = createAction('create finance picture version')
export const beginCreate    = createAction('begin create finance picture version')
export const successCreate  = createAction('success create finance picture version')
export const errorCreate    = createAction('error create finance picture version')

export const deleteRequest  = createAction('delete finance picture version')
export const beginDelete    = createAction('begin delete finance picture version')
export const successDelete  = createAction('success delete finance picture version')
export const errorDelete    = createAction('error delete finance picture version')

export const clearVersions  = createAction('clear finance picture versions')
