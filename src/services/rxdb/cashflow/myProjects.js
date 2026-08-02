import { collection as firestoreCollection, where } from 'firebase/firestore'
import { replicateFirestore } from 'rxdb/plugins/replication-firestore'
import { getRxDb } from '../db'
import { app, db as firestoreDb, COL_CASHFLOW_MY_PROJECTS } from '../../firebase/settings'
import { getTenantId } from '../../tenantContext'

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
          myProjects: { schema, migrationStrategies: { 1: (doc) => doc } },
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
