import { createSlice } from '@reduxjs/toolkit'
import * as actions from '../../actions/domotica/domoticaCommandProfileActions'

const domoticaCommandProfileSlice = createSlice({
  name: 'domoticaCommandProfile',
  initialState: {
    profiles: null,
    fetching: false,
    saving: false,
    profileItems: {},   // { [profileId]: Item[] }
    loadingItems: {},   // { [profileId]: boolean }
    isError: false,
    error: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch profiles
      .addCase(actions.fetchProfilesRequest, (state) => { state.fetching = true; state.isError = false })
      .addCase(actions.beginFetchProfiles, (state) => { state.fetching = true })
      .addCase(actions.successFetchProfiles, (state, { payload }) => {
        state.profiles = payload
        state.fetching = false
      })
      .addCase(actions.errorFetchProfiles, (state, { payload }) => {
        state.error = payload; state.fetching = false; state.isError = true
      })

      // Create profile
      .addCase(actions.beginCreateProfile, (state) => { state.saving = true })
      .addCase(actions.successCreateProfile, (state, { payload }) => {
        state.profiles = state.profiles ? [...state.profiles, payload] : [payload]
        state.saving = false
      })
      .addCase(actions.errorCreateProfile, (state, { payload }) => {
        state.error = payload; state.saving = false; state.isError = true
      })

      // Update profile
      .addCase(actions.beginUpdateProfile, (state) => { state.saving = true })
      .addCase(actions.successUpdateProfile, (state, { payload }) => {
        if (state.profiles) {
          state.profiles = state.profiles.map((p) => (p.id === payload.id ? payload : p))
        }
        state.saving = false
      })
      .addCase(actions.errorUpdateProfile, (state, { payload }) => {
        state.error = payload; state.saving = false; state.isError = true
      })

      // Delete profile
      .addCase(actions.beginDeleteProfile, (state) => { state.saving = true })
      .addCase(actions.successDeleteProfile, (state, { payload }) => {
        if (state.profiles) {
          state.profiles = state.profiles.filter((p) => p.id !== payload.id)
        }
        delete state.profileItems[payload.id]
        delete state.loadingItems[payload.id]
        state.saving = false
      })
      .addCase(actions.errorDeleteProfile, (state, { payload }) => {
        state.error = payload; state.saving = false; state.isError = true
      })

      // Fetch items
      .addCase(actions.fetchItemsRequest, (state, { payload }) => {
        state.loadingItems[payload.profileId] = true
      })
      .addCase(actions.successFetchItems, (state, { payload }) => {
        state.profileItems[payload.profileId] = payload.data
        state.loadingItems[payload.profileId] = false
      })
      .addCase(actions.errorFetchItems, (state, { payload }) => {
        state.loadingItems[payload.profileId] = false
      })

      // Create item
      .addCase(actions.beginCreateItem, (state) => { state.saving = true })
      .addCase(actions.successCreateItem, (state, { payload }) => {
        const { profileId } = payload
        if (state.profileItems[profileId]) {
          state.profileItems[profileId] = [...state.profileItems[profileId], payload]
        } else {
          state.profileItems[profileId] = [payload]
        }
        state.saving = false
      })
      .addCase(actions.errorCreateItem, (state, { payload }) => {
        state.error = payload; state.saving = false; state.isError = true
      })

      // Update item
      .addCase(actions.successUpdateItem, (state, { payload }) => {
        const { profileId } = payload
        if (state.profileItems[profileId]) {
          state.profileItems[profileId] = state.profileItems[profileId].map((i) =>
            i.id === payload.id ? payload : i,
          )
        }
        state.saving = false
      })
      .addCase(actions.errorUpdateItem, (state, { payload }) => {
        state.error = payload; state.saving = false
      })

      // Delete item
      .addCase(actions.successDeleteItem, (state, { payload }) => {
        const { profileId, id } = payload
        if (state.profileItems[profileId]) {
          state.profileItems[profileId] = state.profileItems[profileId].filter((i) => i.id !== id)
        }
      })
      .addCase(actions.errorDeleteItem, (state, { payload }) => {
        state.error = payload
      })

      // Reorder items
      .addCase(actions.successReorderItems, (state, { payload }) => {
        state.profileItems[payload.profileId] = payload.items
      })
  },
})

export default domoticaCommandProfileSlice.reducer
