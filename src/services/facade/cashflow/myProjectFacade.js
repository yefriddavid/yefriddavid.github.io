import * as rxdb from '../../rxdb/cashflow/myProjects'

// Sync with Firebase now runs automatically in the background via RxDB replication
// (retries on failure) — no manual sync/import calls needed.
export const saveProject = rxdb.saveProject
export const deleteProject = rxdb.deleteProject
export const subscribeSyncStatus = rxdb.subscribeSyncStatus
export const subscribeProjects = rxdb.subscribeProjects
