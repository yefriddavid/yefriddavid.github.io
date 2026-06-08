import * as idb from '../idb/tasks'
import * as fb from '../firebase/tasks'

const isDirty = (task) => !task.syncedAt || task.localUpdatedAt > task.syncedAt

export const getLocalTasks = () => idb.getAllTasks()

export const refreshFromFirebase = async (localTasks) => {
  try {
    const fbTasks = await fb.fetchAllTasks()

    const fbMap = new Map(fbTasks.map((t) => [t.id, t]))
    const merged = new Map(fbMap)

    // Local tasks with unsynced changes
    const pendingLocal = (localTasks ?? []).filter(isDirty)

    pendingLocal.forEach((t) => {
      const fb = fbMap.get(t.id)
      // local-only (not in Firebase) or local is newer than Firebase
      if (!fb || (t.localUpdatedAt && fb.syncedAt && t.localUpdatedAt > fb.syncedAt)) {
        merged.set(t.id, t)
      }
    })

    const mergedArray = Array.from(merged.values())

    // Persist merged Firestore state to IDB
    await idb.saveBulkTasks(mergedArray)

    // Delete IDB tasks that were removed in Firestore and have no pending local changes
    const mergedIds = new Set(merged.keys())
    const toDelete = (localTasks ?? []).filter((t) => !mergedIds.has(t.id))
    for (const t of toDelete) {
      await idb.deleteTask(t.id)
    }

    return { tasks: mergedArray, pendingLocal }
  } catch {
    return { tasks: null, pendingLocal: [] }
  }
}

export const saveTask = async (task) => {
  const now = new Date().toISOString()
  const withLocal = { ...task, localUpdatedAt: now }
  try {
    await fb.upsertTask(withLocal)
    const synced = { ...withLocal, syncedAt: now }
    await idb.saveTask(synced)
    return synced
  } catch {
    await idb.saveTask(withLocal)
    return withLocal
  }
}

export const deleteTask = async (id) => {
  try {
    await fb.removeTask(id)
  } catch {
    // offline — Firebase will be out of sync until next open with internet
  }
  await idb.deleteTask(id)
}

export const syncPendingTasks = async (tasks) => {
  const synced = []
  for (const task of tasks) {
    try {
      await fb.upsertTask(task)
      const now = new Date().toISOString()
      const syncedTask = { ...task, syncedAt: now, localUpdatedAt: now }
      await idb.saveTask(syncedTask)
      synced.push(syncedTask)
    } catch {
      // skip — will retry next open
    }
  }
  return synced
}
