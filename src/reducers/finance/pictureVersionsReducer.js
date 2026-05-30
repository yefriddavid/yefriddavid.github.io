import { createSlice } from '@reduxjs/toolkit'
import * as a from '../../actions/finance/pictureVersionsActions'

const slice = createSlice({
  name: 'financePictureVersions',
  initialState: { list: null, loading: false, saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(a.clearVersions,  (state) => { state.list = null })

      .addCase(a.beginFetch,  (state) => { state.loading = true;  state.error = null })
      .addCase(a.successFetch, (state, { payload }) => { state.list = payload; state.loading = false })
      .addCase(a.errorFetch,  (state, { payload }) => { state.error = payload; state.loading = false })

      .addCase(a.beginCreate,  (state) => { state.saving = true })
      .addCase(a.successCreate, (state, { payload }) => {
        state.list = state.list ? [payload, ...state.list] : [payload]
        state.saving = false
      })
      .addCase(a.errorCreate,  (state, { payload }) => { state.error = payload; state.saving = false })

      .addCase(a.beginDelete,  (state) => { state.saving = true })
      .addCase(a.successDelete, (state, { payload }) => {
        state.list = state.list ? state.list.filter((v) => v.id !== payload.id) : null
        state.saving = false
      })
      .addCase(a.errorDelete,  (state, { payload }) => { state.error = payload; state.saving = false })
  },
})

export default slice.reducer
