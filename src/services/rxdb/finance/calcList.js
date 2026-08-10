import { collection as firestoreCollection, where } from 'firebase/firestore'
import { replicateFirestore } from 'rxdb/plugins/replication-firestore'
import { deepEqual } from 'rxdb/plugins/utils'
import { merge } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { getRxDb } from '../db'
import { app, db as firestoreDb, COL_FINANCE_CALC_LIST_GROUPS } from '../../firebase/settings'
import { getTenantId } from '../../tenantContext'
import {
  subscribePeers as subscribeWebrtcPeers,
  connectTo as webrtcConnectTo,
  getMyId as getWebrtcMyId,
} from './calcListWebrtcHandler'
import * as idb from '../../indexeddb/finance/calcList'

// Same conflict-resolution shape as src/services/rxdb/cashflow/myProjects.js: JSON-
// normalize before deepEqual (RxDB's internal "assumed master state" always carries
// `_deleted: false`, which a plain doc lacks — an always-different key that isn't a
// real conflict), last-write-wins by `updatedAt`.
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
    name: { type: 'string' },
    order: { type: 'number' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          order: { type: 'number' },
          budget: {},
          updatedAt: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                index: { type: 'number' },
                description: { type: 'string' },
                category: { type: 'string' },
                classification: { type: 'string' },
                quantity: { type: 'number' },
                value: { type: 'number' },
                note: { type: 'string' },
              },
            },
          },
        },
      },
    },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'tenantId'],
  indexes: ['tenantId'],
}

let collectionPromise = null

function getCollection() {
  if (!collectionPromise) {
    collectionPromise = getRxDb().then((rxdb) =>
      rxdb
        .addCollections({
          calcList: {
            schema,
            // v0 groups predate multi-tenant scoping — stamp them with whatever tenant
            // is active on this device the first time the schema migration runs.
            migrationStrategies: { 1: (doc) => ({ ...doc, tenantId: getTenantId() }) },
            conflictHandler,
          },
        })
        .then((cols) => cols.calcList),
    )
  }
  return collectionPromise
}

let replicationState = null
let replicatedTenantId = null

// Live, retrying replication against Firestore — same pattern as myProjects.js.
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
      collection: firestoreCollection(firestoreDb, COL_FINANCE_CALC_LIST_GROUPS),
    },
    pull: { filter: where('tenantId', '==', tenantId) },
    push: {},
    live: true,
    retryTime: 5000,
  })
  replicationState.error$.subscribe((err) => {
    const inner = err.parameters?.errors?.[0] ?? err.parameters?.error
    console.error('calcList replication error:', inner?.message || err.message)
  })
  return replicationState
}

// One-time: seed the RxDB collection from a device's existing raw-IndexedDB data.
// No-ops once the collection already has data — that emptiness check IS the "did we
// migrate yet" marker, no separate flag needed. Old IDB store is left untouched
// afterward (rollback path stays intact).
export async function migrateFromIndexedDb() {
  const rxCollection = await getCollection()
  const count = await rxCollection.count().exec()
  if (count > 0) return

  const all = await idb.fetchAll()
  if (!all.length) return

  const tenantId = getTenantId()
  const groups = []
  const oldLists = []
  for (const doc of all) {
    if (Array.isArray(doc.items)) groups.push({ ...doc, tenantId })
    else if (Array.isArray(doc.rows)) oldLists.push(doc)
  }
  if (oldLists.length > 0) {
    const sorted = [...oldLists].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    groups.push({
      id: crypto.randomUUID(),
      tenantId,
      name: 'General',
      order: 0,
      items: sorted.map((l, i) => ({ ...l, order: i })),
      updatedAt: new Date().toISOString(),
    })
  }
  if (groups.length) await rxCollection.bulkUpsert(groups)
}

// Emits 'syncing' | 'synced' | 'error' as the Firestore replication cycles run.
export async function subscribeSyncStatus(cb) {
  const state = await ensureReplication(getTenantId())
  const status$ = merge(
    state.active$.pipe(map((active) => (active ? 'syncing' : 'synced'))),
    state.error$.pipe(map(() => 'error')),
  ).pipe(startWith('synced'))
  const sub = status$.subscribe(cb)
  return () => sub.unsubscribe()
}

// P2P WebRTC sync is superseded by Firestore replication above — left in place
// (inert, no connectionHandlerCreator invokes it anymore) pending a decision on
// whether to remove SyncModal/PresenceModal/usePeerSync.
export async function subscribePeers(cb) {
  return subscribeWebrtcPeers(cb)
}

export async function connectTo(remoteId) {
  return webrtcConnectTo(remoteId)
}

export function getMyId() {
  return getWebrtcMyId()
}

export async function subscribeGroups(cb) {
  const tenantId = getTenantId()
  await ensureReplication(tenantId)
  const rxCollection = await getCollection()
  const sub = rxCollection.find({ selector: { tenantId } }).$.subscribe((docs) => {
    const groups = docs
      .map((d) => d.toJSON())
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    cb(groups)
  })
  return () => sub.unsubscribe()
}

export async function saveGroup(group) {
  const rxCollection = await getCollection()
  await rxCollection.upsert({
    ...group,
    id: group.id || crypto.randomUUID(),
    tenantId: getTenantId(),
  })
}

export async function deleteGroup(id) {
  const rxCollection = await getCollection()
  const doc = await rxCollection.findOne(id).exec()
  if (doc) await doc.remove()
}
