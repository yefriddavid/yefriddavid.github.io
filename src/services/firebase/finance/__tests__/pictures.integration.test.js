/**
 * Integration tests for the pictures Firestore service.
 *
 * Hits the real Firebase project: cashflow-test-afc07 (test environment).
 * Uses the Firebase SDK directly — bypasses firestoreCall (which necesita
 * browser auth/window.location) para mantener el entorno de test limpio.
 *
 * Ciclo completo: CREATE → READ → LIST → UPDATE → DELETE
 *
 * Run:
 *   npx vitest run --config vitest.integration.config.mjs \
 *     src/services/firebase/finance/__tests__/pictures.integration.test.js
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'

// ─── Firebase init (proyecto de test: cashflow-test-afc07) ────────────────────

// Vitest exposes test.env vars through process.env (not import.meta.env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const TEST_APP_NAME = 'pictures-integration-test'
const COL = 'Finance_Pictures'
const TENANT_ID = '__test__'

let db

// ─── Helpers SDK (espejo exacto de pictures.js pero sin firestoreCall) ────────

const toStr = (ts) => ts?.toDate?.()?.toISOString() ?? ts ?? null

const addPicture = (payload) =>
  addDoc(collection(db, COL), {
    ...payload,
    tenantId: TENANT_ID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).then((ref) => ref.id)

const getPicture = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) throw new Error('Cuadro no encontrado')
  const data = snap.data()
  return { id: snap.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
}

const getPictures = async () => {
  const snap = await getDocs(query(collection(db, COL), where('tenantId', '==', TENANT_ID)))
  return snap.docs.map((d) => {
    const data = d.data()
    return { id: d.id, ...data, createdAt: toStr(data.createdAt), updatedAt: toStr(data.updatedAt) }
  })
}

const updatePicture = (id, payload) =>
  updateDoc(doc(db, COL, id), { ...payload, updatedAt: serverTimestamp() })

const deletePicture = (id) => deleteDoc(doc(db, COL, id))

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const TEST_CANVAS = {
  width: 20,
  height: 15,
  unit: 'cm',
  dpi: 96,
  grid: 1,
  snap: true,
  bg: '#ffffff',
}

const makeNode = (overrides = {}) => ({
  id: 'node-1',
  type: 'rect',
  name: 'rect 1',
  groupId: null,
  visible: true,
  locked: false,
  x: 100,
  y: 80,
  w: 200,
  h: 120,
  rotation: 0,
  fill: '#4488ff',
  fillOpacity: 1,
  stroke: '#2244aa',
  strokeWidth: 2,
  sides: 6,
  points: 5,
  text: 'Texto',
  fontSize: 16,
  fontColor: '#000000',
  ...overrides,
})

// ─── Estado compartido entre tests ───────────────────────────────────────────

let docId        // id creado en beforeAll
let createdPic   // snapshot del create
let readPic      // snapshot del read
let updatedPic   // snapshot del update (con 2 nodos)
let multiPic     // snapshot del update (con 8 tipos de figuras)

// ─── Setup y teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  const existing = getApps().find((a) => a.name === TEST_APP_NAME)
  const app = existing ?? initializeApp(firebaseConfig, TEST_APP_NAME)
  db = getFirestore(app)

  // CREATE — el id se comparte con todos los tests
  docId = await addPicture({
    name: '__integration_test__ picture',
    canvas: TEST_CANVAS,
    nodes: [makeNode()],
    groups: [],
  })
})

afterAll(async () => {
  if (docId) {
    try { await deletePicture(docId) } catch { /* ya fue eliminado en el test */ }
  }
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('pictures Firestore — integration (cashflow-test-afc07)', () => {

  // ── CREATE ──────────────────────────────────────────────────────────────────

  it('addPicture: beforeAll creó el documento y retornó un id válido', () => {
    expect(typeof docId).toBe('string')
    expect(docId.length).toBeGreaterThan(0)
  })

  // ── READ ────────────────────────────────────────────────────────────────────

  it('getPicture: recupera el documento con todos sus campos', async () => {
    readPic = await getPicture(docId)

    expect(readPic.id).toBe(docId)
    expect(readPic.name).toBe('__integration_test__ picture')
    expect(readPic.canvas).toMatchObject(TEST_CANVAS)
    expect(readPic.nodes).toHaveLength(1)
    expect(readPic.groups).toEqual([])
    expect(readPic.tenantId).toBe(TENANT_ID)
    expect(readPic.createdAt).not.toBeNull()
    expect(readPic.updatedAt).not.toBeNull()
  })

  it('getPicture: el nodo guardado tiene todos los campos sin undefined', async () => {
    if (!readPic) readPic = await getPicture(docId)
    const node = readPic.nodes[0]

    const required = [
      'id', 'type', 'name', 'groupId', 'visible', 'locked',
      'x', 'y', 'w', 'h', 'rotation',
      'fill', 'fillOpacity', 'stroke', 'strokeWidth',
      'sides', 'points', 'text', 'fontSize', 'fontColor',
    ]
    for (const field of required) {
      expect(node, `campo "${field}" no debe ser undefined`).toHaveProperty(field)
      expect(node[field], `campo "${field}" no debe ser undefined`).not.toBeUndefined()
    }
  })

  // ── LIST ────────────────────────────────────────────────────────────────────

  it('getPictures: el documento aparece en el listado filtrado por tenantId', async () => {
    const list = await getPictures()
    const found = list.find((p) => p.id === docId)

    expect(found).toBeDefined()
    expect(found.name).toBe('__integration_test__ picture')
  })

  // ── UPDATE — renombrar y agregar nodo ────────────────────────────────────────

  it('updatePicture: renombra el cuadro y agrega un segundo nodo', async () => {
    await updatePicture(docId, {
      name: '__integration_test__ picture (actualizado)',
      canvas: { ...TEST_CANVAS, bg: '#f0f0f0' },
      nodes: [
        makeNode(),
        makeNode({ id: 'node-2', type: 'circle', name: 'circle 2', fill: '#ff4444', fillOpacity: 0.8 }),
      ],
      groups: [{ id: 'grp-1', name: 'Grupo test', collapsed: false }],
    })

    updatedPic = await getPicture(docId)

    expect(updatedPic.name).toBe('__integration_test__ picture (actualizado)')
    expect(updatedPic.canvas.bg).toBe('#f0f0f0')
    expect(updatedPic.nodes).toHaveLength(2)
    expect(updatedPic.nodes[1].type).toBe('circle')
    expect(updatedPic.nodes[1].fill).toBe('#ff4444')
    expect(updatedPic.nodes[1].fillOpacity).toBe(0.8)
    expect(updatedPic.groups).toHaveLength(1)
    expect(updatedPic.groups[0].name).toBe('Grupo test')
  })

  it('updatePicture: updatedAt >= createdAt tras la modificación', async () => {
    if (!updatedPic) updatedPic = await getPicture(docId)
    expect(new Date(updatedPic.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(updatedPic.createdAt).getTime(),
    )
  })

  // ── UPDATE — cambio de unidad de lienzo ──────────────────────────────────────

  it('updatePicture: cambio de unidad del lienzo (cm → mm) persiste', async () => {
    await updatePicture(docId, {
      name: '__integration_test__ picture (actualizado)',
      canvas: { ...TEST_CANVAS, unit: 'mm', width: 200, height: 150 },
      nodes: [makeNode()],
      groups: [],
    })

    const pic = await getPicture(docId)
    expect(pic.canvas.unit).toBe('mm')
    expect(pic.canvas.width).toBe(200)
    expect(pic.canvas.height).toBe(150)
  })

  // ── UPDATE — múltiples tipos de figura ───────────────────────────────────────

  it('updatePicture: 8 tipos de figura se guardan y recuperan sin pérdida de datos', async () => {
    const nodes = [
      makeNode({ id: 'n-1', type: 'rect' }),
      makeNode({ id: 'n-2', type: 'circle' }),
      makeNode({ id: 'n-3', type: 'triangle' }),
      makeNode({ id: 'n-4', type: 'polygon', sides: 8 }),
      makeNode({ id: 'n-5', type: 'star', points: 6 }),
      makeNode({ id: 'n-6', type: 'line' }),
      makeNode({ id: 'n-7', type: 'arrow' }),
      makeNode({ id: 'n-8', type: 'text', text: 'Hola mundo', fontSize: 24 }),
    ]

    await updatePicture(docId, {
      name: '__integration_test__ picture (actualizado)',
      canvas: TEST_CANVAS,
      nodes,
      groups: [],
    })

    multiPic = await getPicture(docId)

    expect(multiPic.nodes).toHaveLength(8)
    expect(multiPic.nodes.find((n) => n.id === 'n-4').sides).toBe(8)
    expect(multiPic.nodes.find((n) => n.id === 'n-5').points).toBe(6)
    expect(multiPic.nodes.find((n) => n.id === 'n-8').text).toBe('Hola mundo')
    expect(multiPic.nodes.find((n) => n.id === 'n-8').fontSize).toBe(24)
  })

  // ── DELETE ──────────────────────────────────────────────────────────────────

  it('deletePicture: elimina el documento de Firestore', async () => {
    await deletePicture(docId)
    await expect(getPicture(docId)).rejects.toThrow('Cuadro no encontrado')
  })

  it('deletePicture: el documento ya no aparece en el listado', async () => {
    const list = await getPictures()
    expect(list.find((p) => p.id === docId)).toBeUndefined()
  })
})
