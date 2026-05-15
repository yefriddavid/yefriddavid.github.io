import { createAction } from '@reduxjs/toolkit'

// ── Profiles ──────────────────────────────────────────────────────────────────
export const fetchProfilesRequest = createAction('fetch domotica command profiles')
export const beginFetchProfiles = createAction('begin fetch domotica command profiles')
export const successFetchProfiles = createAction('fetch domotica command profiles success')
export const errorFetchProfiles = createAction('fetch domotica command profiles error')

export const createProfileRequest = createAction('create domotica command profile')
export const beginCreateProfile = createAction('begin create domotica command profile')
export const successCreateProfile = createAction('create domotica command profile success')
export const errorCreateProfile = createAction('create domotica command profile error')

export const updateProfileRequest = createAction('update domotica command profile')
export const beginUpdateProfile = createAction('begin update domotica command profile')
export const successUpdateProfile = createAction('update domotica command profile success')
export const errorUpdateProfile = createAction('update domotica command profile error')

export const deleteProfileRequest = createAction('delete domotica command profile')
export const beginDeleteProfile = createAction('begin delete domotica command profile')
export const successDeleteProfile = createAction('delete domotica command profile success')
export const errorDeleteProfile = createAction('delete domotica command profile error')

// ── Profile Items ─────────────────────────────────────────────────────────────
export const fetchItemsRequest = createAction('fetch domotica command profile items') // { profileId }
export const beginFetchItems = createAction('begin fetch domotica command profile items')
export const successFetchItems = createAction('fetch domotica command profile items success') // { profileId, data }
export const errorFetchItems = createAction('fetch domotica command profile items error')

export const createItemRequest = createAction('create domotica command profile item')
export const beginCreateItem = createAction('begin create domotica command profile item')
export const successCreateItem = createAction('create domotica command profile item success')
export const errorCreateItem = createAction('create domotica command profile item error')

export const updateItemRequest = createAction('update domotica command profile item')
export const successUpdateItem = createAction('update domotica command profile item success')
export const errorUpdateItem = createAction('update domotica command profile item error')

export const deleteItemRequest = createAction('delete domotica command profile item')
export const successDeleteItem = createAction('delete domotica command profile item success')
export const errorDeleteItem = createAction('delete domotica command profile item error')

export const reorderItemsRequest = createAction('reorder domotica command profile items') // { profileId, items }
export const successReorderItems = createAction('reorder domotica command profile items success')
