import { createAction } from '@reduxjs/toolkit'

export const loadRequest = createAction('load assets')
export const loadSuccess = createAction('load assets success')
export const loadError = createAction('load assets error')

export const saveRequest = createAction('save asset')
export const saveSuccess = createAction('save asset success')
export const saveError = createAction('save asset error')

export const deleteRequest = createAction('delete asset')
export const deleteSuccess = createAction('delete asset success')
export const deleteError = createAction('delete asset error')

export const syncRequest = createAction('sync asset to firebase')
export const syncSuccess = createAction('sync asset to firebase success')
export const syncError = createAction('sync asset to firebase error')

export const syncAllRequest = createAction('sync all assets to firebase')
export const syncAllSuccess = createAction('sync all assets to firebase success')
export const syncAllError = createAction('sync all assets to firebase error')

export const importRequest = createAction('import assets from firebase')
export const importSuccess = createAction('import assets from firebase success')
export const importError = createAction('import assets from firebase error')
