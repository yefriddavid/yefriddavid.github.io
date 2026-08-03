import { replicateWebRTC } from 'rxdb/plugins/replication-webrtc'
import { deepEqual } from 'rxdb/plugins/utils'
import { merge } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { getRxDb } from '../db'
import {
  createCalcListWebrtcHandler,
  subscribePeers as subscribeWebrtcPeers,
  connectTo as webrtcConnectTo,
  getMyId as getWebrtcMyId,
} from './calcListWebrtcHandler'
import * as idb from '../../indexeddb/finance/calcList'

const TOPIC = 'finance-calc-list'

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
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 128 },
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
  required: ['id'],
}

let collectionPromise = null

function getCollection() {
  if (!collectionPromise) {
    collectionPromise = getRxDb().then((rxdb) =>
      rxdb.addCollections({ calcList: { schema, conflictHandler } }).then((cols) => cols.calcList),
    )
  }
  return collectionPromise
}

let replicationPoolPromise = null

// Live, auto-discovering P2P replication over WebRTC — replaces the old one-shot
// "send the whole groups blob once" hand-rolled sync.
function ensureReplication() {
  if (!replicationPoolPromise) {
    replicationPoolPromise = getCollection().then((rxCollection) =>
      replicateWebRTC({
        collection: rxCollection,
        topic: TOPIC,
        connectionHandlerCreator: createCalcListWebrtcHandler,
        pull: {},
        push: {},
        retryTime: 5000,
      }).then((pool) => {
        pool.error$.subscribe((err) =>
          console.error('calcList replication error:', err?.message || err),
        )
        return pool
      }),
    )
  }
  return replicationPoolPromise
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

  const groups = []
  const oldLists = []
  for (const doc of all) {
    if (Array.isArray(doc.items)) groups.push(doc)
    else if (Array.isArray(doc.rows)) oldLists.push(doc)
  }
  if (oldLists.length > 0) {
    const sorted = [...oldLists].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    groups.push({
      id: crypto.randomUUID(),
      name: 'General',
      order: 0,
      items: sorted.map((l, i) => ({ ...l, order: i })),
      updatedAt: new Date().toISOString(),
    })
  }
  if (groups.length) await rxCollection.bulkUpsert(groups)
}

// active$/error$ pair like replicateFirestore doesn't exist on the WebRTC pool (it
// tracks a peerStates$ map instead, one per connected peer) — so this status is a
// simplified 3-state read of "do we currently have any peer" rather than a true
// per-cycle syncing/idle signal.
export async function subscribeSyncStatus(cb) {
  const pool = await ensureReplication()
  const status$ = merge(
    pool.peerStates$.pipe(map((m) => (m.size > 0 ? 'synced' : 'no_peers'))),
    pool.error$.pipe(map(() => 'error')),
  ).pipe(startWith('no_peers'))
  const sub = status$.subscribe(cb)
  return () => sub.unsubscribe()
}

export async function subscribePeers(cb) {
  await ensureReplication()
  return subscribeWebrtcPeers(cb)
}

export async function connectTo(remoteId) {
  await ensureReplication()
  return webrtcConnectTo(remoteId)
}

export function getMyId() {
  return getWebrtcMyId()
}

export async function subscribeGroups(cb) {
  await ensureReplication()
  const rxCollection = await getCollection()
  const sub = rxCollection.find().$.subscribe((docs) => {
    const groups = docs
      .map((d) => d.toJSON())
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    cb(groups)
  })
  return () => sub.unsubscribe()
}

export async function saveGroup(group) {
  const rxCollection = await getCollection()
  await rxCollection.upsert({ ...group, id: group.id || crypto.randomUUID() })
}

export async function deleteGroup(id) {
  const rxCollection = await getCollection()
  const doc = await rxCollection.findOne(id).exec()
  if (doc) await doc.remove()
}
