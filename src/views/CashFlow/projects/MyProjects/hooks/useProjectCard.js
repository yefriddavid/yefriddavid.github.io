import { useEffect, useState } from 'react'
import { uid, now, totalOf, paidOf } from '../helpers'

export function useProjectCard(project, onSave) {
  const [localDescription, setLocalDescription] = useState(project.description)
  const [localGoal, setLocalGoal] = useState(String(project.goal ?? ''))
  const [localNotes, setLocalNotes] = useState(project.notes ?? '')
  const [localDate, setLocalDate] = useState(project.date ?? '')
  const [localItems, setLocalItems] = useState(project.items ?? [])
  const [localProjectNotes, setLocalProjectNotes] = useState(project.projectNotes ?? [])
  const [isDirty, setIsDirty] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [editingGoal, setEditingGoal] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [localOrigen, setLocalOrigen] = useState('')
  const [editingValueId, setEditingValueId] = useState(null)
  const [localValue, setLocalValue] = useState('')
  const [cloning, setCloning] = useState(false)
  const [cloneName, setCloneName] = useState('')
  const [showProjectNotes, setShowProjectNotes] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteRef, setNewNoteRef] = useState('')
  const [dragItemId, setDragItemId] = useState(null)
  const [dragOverItemId, setDragOverItemId] = useState(null)

  useEffect(() => {
    setLocalDescription(project.description)
    setLocalGoal(String(project.goal ?? ''))
    setLocalNotes(project.notes ?? '')
    setLocalDate(project.date ?? '')
    setLocalItems(project.items ?? [])
    setLocalProjectNotes(project.projectNotes ?? [])
    setIsDirty(false)
  }, [project.updatedAt])

  const mark = () => setIsDirty(true)

  const total = totalOf(localItems)
  const paid = paidOf(localItems)
  const goal = Number(localGoal) || 0
  const remaining = goal > 0 ? goal - total : null
  const paidOverrun = goal > 0 && paid > goal ? paid - goal : 0

  const commitName = () => {
    setEditingName(false)
    const trimmed = localDescription.trim()
    if (!trimmed) setLocalDescription(project.description)
    else mark()
  }

  const startItemEdit = (item) => {
    setEditingItemId(item.id)
    setLocalOrigen(item.origen)
  }

  const commitItem = (item) => {
    setEditingItemId(null)
    const trimmed = localOrigen.trim()
    if (trimmed === item.origen) return
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, origen: trimmed } : it)))
    mark()
  }

  const commitGoal = () => {
    setEditingGoal(false)
    mark()
  }

  const commitNotes = () => {
    setEditingNotes(false)
    mark()
  }

  const startValueEdit = (item) => {
    setEditingValueId(item.id)
    setLocalValue(String(item.value ?? ''))
  }

  const commitValue = (item) => {
    setEditingValueId(null)
    const num = Number(String(localValue).replace(/\D/g, ''))
    if (num === Number(item.value)) return
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, value: num } : it)))
    mark()
  }

  const toggleItemPaid = (item) => {
    setLocalItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, paid: !it.paid } : it)))
    mark()
  }

  const reorderCardItems = (fromId, toId) => {
    if (fromId === toId) return
    setLocalItems((prev) => {
      const next = [...prev]
      const fromIdx = next.findIndex((it) => it.id === fromId)
      const toIdx = next.findIndex((it) => it.id === toId)
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
    mark()
  }

  const addItem = () => {
    const newItem = { id: uid(), origen: '', value: 0, paid: false }
    setLocalItems((prev) => [...prev, newItem])
    mark()
    setTimeout(() => startItemEdit(newItem), 50)
  }

  const removeItem = (itemId) => {
    setLocalItems((prev) => prev.filter((it) => it.id !== itemId))
    mark()
  }

  const saveCardNote = () => {
    if (!newNoteText.trim()) return
    const note = { id: uid(), text: newNoteText.trim(), reference: newNoteRef.trim(), createdAt: now() }
    setLocalProjectNotes((prev) => [...prev, note])
    setNewNoteText('')
    setNewNoteRef('')
    setAddingNote(false)
    mark()
  }

  const deleteCardNote = (noteId) => {
    setLocalProjectNotes((prev) => prev.filter((n) => n.id !== noteId))
    mark()
  }

  const handleSaveCard = () => {
    onSave({
      ...project,
      description: localDescription.trim() || project.description,
      goal: Number(localGoal) || 0,
      notes: localNotes.trim(),
      date: localDate.trim(),
      items: localItems,
      projectNotes: localProjectNotes,
      updatedAt: now(),
      syncedAt: null,
    })
    setIsDirty(false)
  }

  return {
    localDescription,
    setLocalDescription,
    localGoal,
    setLocalGoal,
    localNotes,
    setLocalNotes,
    localDate,
    localItems,
    localProjectNotes,
    isDirty,
    total,
    paid,
    goal,
    remaining,
    paidOverrun,
    editingName,
    setEditingName,
    editingGoal,
    setEditingGoal,
    editingNotes,
    setEditingNotes,
    editingItemId,
    localOrigen,
    setLocalOrigen,
    editingValueId,
    localValue,
    setLocalValue,
    dragItemId,
    setDragItemId,
    dragOverItemId,
    setDragOverItemId,
    cloning,
    setCloning,
    cloneName,
    setCloneName,
    showProjectNotes,
    setShowProjectNotes,
    addingNote,
    setAddingNote,
    newNoteText,
    setNewNoteText,
    newNoteRef,
    setNewNoteRef,
    mark,
    commitName,
    commitGoal,
    commitNotes,
    startItemEdit,
    commitItem,
    startValueEdit,
    commitValue,
    toggleItemPaid,
    reorderCardItems,
    addItem,
    removeItem,
    saveCardNote,
    deleteCardNote,
    handleSaveCard,
  }
}
