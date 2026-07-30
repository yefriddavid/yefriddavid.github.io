import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
const useSavedViews = (storageKey) => {
  const navigate = useNavigate()
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
  }

  const deleteView = (id) => persistSavedViews(savedViews.filter((v) => v.id !== id))

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
    loadView,
  }
}

export default useSavedViews
