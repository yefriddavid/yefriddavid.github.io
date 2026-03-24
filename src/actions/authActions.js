import { createAction } from '@reduxjs/toolkit'

// Legacy login actions (used by loginReducer)
export const login = createAction('login form')
export const errorRequest = createAction('login error request')
export const beginLoginRequest = createAction('login begin request')
export const successRequest = createAction('login success request')

// Profile actions
export const fetchProfile = createAction('fetch user profile')
export const fetchProfileSuccess = createAction('fetch user profile success')
export const fetchProfileError = createAction('fetch user profile error')

export const updateProfile = createAction('update user profile')
export const updateProfileSuccess = createAction('update user profile success')
export const updateProfileError = createAction('update user profile error')

export const updateAvatar = createAction('update user avatar')
export const updateAvatarSuccess = createAction('update user avatar success')
export const updateAvatarError = createAction('update user avatar error')

export const clearProfile = createAction('clear user profile')
