import { collection as firestoreCollection, where } from 'firebase/firestore'
import { replicateFirestore } from 'rxdb/plugins/replication-firestore'
import { deepEqual } from 'rxdb/plugins/utils'
import { merge } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { getRxDb } from '../db'
import { app, db as firestoreDb, COL_CASHFLOW_MY_PROJECTS } from '../../firebase/settings'
import { getTenantId } from '../../tenantContext'

// RxDB's default conflict handler always keeps the server ("master") copy and
// silently drops the local edit — see rxdb/replication-protocol/default-conflict-handler.
// That makes single-user edits (e.g. archiving) vanish on the next sync whenever the
// local "assumed master state" bookkeeping is stale (notably right after a schema
// migration). This app has one editor per tenant, so last-write-wins by updatedAt is
// the correct resolution instead of always favoring whatever is already on the server.
//
// Two shape mismatches make RxDB's default isEqual always see a "conflict" for any
// doc that already exists in Firestore, so real edits (e.g. archiving) never push:
// 1. Projects created before the RxDB migration carry a legacy `syncedAt` Firestore
//    Timestamp field. Read straight from Firestore it's a real Timestamp instance;
//    once round-tripped through local storage it becomes a plain
//    {seconds,nanoseconds} object. deepEqual() also checks constructor equality, so
//    Timestamp !== Object forever. JSON-normalizing both sides strips that identity.
// 2. Firestore documents never carry RxDB's internal `_deleted` flag, while the local
//    "assumed master state" always has `_deleted: false` for a non-deleted doc — an
//    always-different key that isn't a real conflict. Default it to false when absent.
const normalize = (doc) => {
  const plain = JSON.parse(JSON.stringify(doc))
  if (plain._deleted === undefined) plain._deleted = false
  return plain
}
const conflictHandler = {
  isEqual: (a, b) => deepEqual(normalize(a), normalize(b)),
  resolve: async (i) => {
    const localIsNewer = (i.newDocumentState.updatedAt ?? '') >= (i.realMasterState.updatedAt ?? '')
    return localIsNewer ? i.newDocumentState : i.realMasterState
  },
}

const schema = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
    tenantId: { type: 'string', maxLength: 128 },
    description: { type: 'string' },
    date: { type: 'string' },
    goal: { type: 'number' },
    notes: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          origen: { type: 'string' },
          value: { type: 'number' },
          paid: { type: 'boolean' },
        },
      },
    },
    projectNotes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          reference: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
    sortOrder: { type: 'number' },
    archived: { type: 'boolean' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'tenantId'],
  indexes: ['tenantId'],
}

let collectionPromise = null
let replicationState = null
let replicatedTenantId = null

function getCollection() {
  if (!collectionPromise) {
    collectionPromise = getRxDb().then((rxdb) =>
      rxdb
        .addCollections({
          myProjects: { schema, migrationStrategies: { 1: (doc) => doc }, conflictHandler },
        })
        .then((cols) => cols.myProjects),
    )
  }
  return collectionPromise
}

// Live, retrying replication against Firestore — replaces the old manual "sync" button.
async function ensureReplication(tenantId) {
  const rxCollection = await getCollection()
  if (replicationState && replicatedTenantId === tenantId) return replicationState
  if (replicationState) await replicationState.cancel()

  replicatedTenantId = tenantId
  replicationState = replicateFirestore({
    collection: rxCollection,
    firestore: {
      projectId: app.options.projectId,
      database: firestoreDb,
      collection: firestoreCollection(firestoreDb, COL_CASHFLOW_MY_PROJECTS),
    },
    pull: { filter: where('tenantId', '==', tenantId) },
    push: {},
    live: true,
    retryTime: 5000,
  })
  // Replication runs in the background with silent retries — without this,
  // a permission or schema error would just retry forever with no visible signal.
  replicationState.error$.subscribe((err) => {
    const inner = err.parameters?.errors?.[0] ?? err.parameters?.error
    console.error('myProjects replication error:', inner?.message || err.message)
  })
  await replicationState.awaitInitialReplication()
  return replicationState
}

// Emits 'syncing' | 'synced' | 'error' as the Firestore replication cycles run.
// Returns an unsubscribe function.
export async function subscribeSyncStatus(cb) {
  const tenantId = getTenantId()
  const state = await ensureReplication(tenantId)
  const status$ = merge(
    state.active$.pipe(map((active) => (active ? 'syncing' : 'synced'))),
    state.error$.pipe(map(() => 'error')),
  ).pipe(startWith('synced'))
  const sub = status$.subscribe(cb)
  return () => sub.unsubscribe()
}

export async function getAllProjects() {
  const tenantId = getTenantId()
  await ensureReplication(tenantId)
  const rxCollection = await getCollection()
  const docs = await rxCollection.find({ selector: { tenantId } }).exec()
  return docs.map((d) => d.toJSON())
}

export async function saveProject(project) {
  const rxCollection = await getCollection()
  await rxCollection.upsert({ ...project, tenantId: getTenantId() })
}

export async function deleteProject(id) {
  const rxCollection = await getCollection()
  const doc = await rxCollection.findOne(id).exec()
  if (doc) await doc.remove()
}
