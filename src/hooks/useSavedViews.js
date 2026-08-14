import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { push as notify } from 'src/reducers/notificationsSlice'

const loadSavedViews = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

// Named URL snapshots — a page's filters already live in the URL (via
// useSearchParams), so "saving a view" is just naming the current
// pathname+search string and restoring it later navigates back to it.
// Everything here is a synchronous localStorage write (no saga round-trip),
// so — unlike Firestore-backed actions — it's safe to toast directly here.
const useSavedViews = (storageKey) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showViewModal, setShowViewModal] = useState(false)
  const [savedViews, setSavedViews] = useState(() => loadSavedViews(storageKey))
  const [saveViewFormKey, setSaveViewFormKey] = useState(0)

  const persistSavedViews = (views) => {
    setSavedViews(views)
    localStorage.setItem(storageKey, JSON.stringify(views))
  }

  const saveView = (name) => {
    if (!name) return
    const view = {
      id: crypto.randomUUID(),
      name,
      url: window.location.pathname + window.location.search,
      createdAt: new Date().toISOString(),
    }
    persistSavedViews([view, ...savedViews])
    setSaveViewFormKey((k) => k + 1)
    dispatch(notify({ type: 'success', message: 'Vista guardada.' }))
  }

  const deleteView = (id) => {
    persistSavedViews(savedViews.filter((v) => v.id !== id))
    dispatch(notify({ type: 'success', message: 'Vista eliminada.' }))
  }

  // Overwrites a saved view's URL with the current filters — same name/id,
  // so it updates in place instead of the user having to delete + re-save.
  const updateView = (id) => {
    persistSavedViews(
      savedViews.map((v) =>
        v.id === id ? { ...v, url: window.location.pathname + window.location.search } : v,
      ),
    )
    dispatch(notify({ type: 'success', message: 'Vista actualizada.' }))
  }

  const loadView = (view) => {
    navigate(view.url)
    setShowViewModal(false)
  }

  return {
    showViewModal,
    setShowViewModal,
    savedViews,
    saveViewFormKey,
    saveView,
    deleteView,
    updateView,
    loadView,
  }
}

export default useSavedViews
