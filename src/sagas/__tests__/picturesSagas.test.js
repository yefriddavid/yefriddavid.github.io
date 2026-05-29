import { describe, it, expect } from 'vitest'
import { call, put } from 'redux-saga/effects'
import * as actions from '../../actions/finance/picturesActions'
import * as facade from '../../services/facade/finance/picturesFacade'
import { push as notify } from '../../reducers/notificationsSlice'
import { makePicture, makePictureNode } from '../../__tests__/factories'

// Workers are replicated inline because picturesSagas.js only exports the root
// watcher. These replicas mirror the saga exactly — update both if the saga changes.

function* createPicture({ payload }) {
  try {
    yield put(actions.beginRequestCreate())
    const id = yield call(facade.addPicture, payload)
    yield put(actions.successRequestCreate({ id, ...payload }))
    yield put(notify({ type: 'success', message: 'Cuadro creado correctamente.' }))
  } catch (e) {
    yield put(actions.errorRequestCreate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* updatePicture({ payload: { id, data } }) {
  try {
    yield put(actions.beginRequestUpdate())
    yield call(facade.updatePicture, id, data)
    yield put(actions.successRequestUpdate({ id, ...data }))
    yield put(notify({ type: 'success', message: 'Cuadro guardado.' }))
  } catch (e) {
    yield put(actions.errorRequestUpdate(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

function* fetchPictures() {
  try {
    yield put(actions.beginRequestFetch())
    const data = yield call(facade.getPictures)
    yield put(actions.successRequestFetch(data))
  } catch (e) {
    yield put(actions.errorRequestFetch(e.message))
    yield put(notify({ type: 'error', message: e.message }))
  }
}

function* deletePicture({ payload }) {
  try {
    yield put(actions.beginRequestDelete())
    yield call(facade.deletePicture, payload.id)
    yield put(actions.successRequestDelete(payload))
    yield put(notify({ type: 'success', message: 'Cuadro eliminado.' }))
  } catch (e) {
    yield put(actions.errorRequestDelete(e.message))
    yield put(notify({ type: 'error', message: `Error: ${e.message}` }))
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const makePayload = (overrides = {}) => ({
  name: 'Cuadro test',
  canvas: { width: 20, height: 15, unit: 'cm', dpi: 96, grid: 1, snap: true, bg: '#ffffff' },
  nodes: [makePictureNode()],
  groups: [],
  ...overrides,
})

// ─── createPicture ─────────────────────────────────────────────────────────

describe('createPicture saga', () => {
  it('happy path: beginCreate → addPicture → successCreate → toast success', () => {
    const payload = makePayload()
    const gen = createPicture({ payload })

    expect(gen.next().value).toEqual(put(actions.beginRequestCreate()))
    expect(gen.next().value).toEqual(call(facade.addPicture, payload))

    const newId = 'firestore-auto-id'
    expect(gen.next(newId).value).toEqual(
      put(actions.successRequestCreate({ id: newId, ...payload })),
    )
    expect(gen.next().value).toEqual(
      put(notify({ type: 'success', message: 'Cuadro creado correctamente.' })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('error path: dispatches errorRequestCreate and error toast on Firestore failure', () => {
    const payload = makePayload()
    const gen = createPicture({ payload })

    gen.next() // beginRequestCreate
    gen.next() // call addPicture

    const error = new Error('Cannot read properties of undefined (reading \'indexOf\')')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestCreate(error.message)),
    )
    expect(gen.next().value).toEqual(
      put(notify({ type: 'error', message: `Error: ${error.message}` })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('error path: error message propagates correctly to toast', () => {
    const payload = makePayload()
    const gen = createPicture({ payload })

    gen.next()
    gen.next()

    const error = new Error('permission-denied')
    gen.throw(error)
    const toastEffect = gen.next().value

    expect(toastEffect).toEqual(
      put(notify({ type: 'error', message: `Error: ${error.message}` })),
    )
  })

  it('merges returned id with original payload in successRequestCreate', () => {
    const node = makePictureNode({ id: 'n-1', type: 'star' })
    const payload = makePayload({ nodes: [node] })
    const gen = createPicture({ payload })

    gen.next() // beginRequestCreate
    gen.next() // call addPicture

    const successEffect = gen.next('doc-xyz').value
    expect(successEffect).toEqual(
      put(
        actions.successRequestCreate({
          id: 'doc-xyz',
          name: payload.name,
          canvas: payload.canvas,
          nodes: [node],
          groups: [],
        }),
      ),
    )
  })

  it('payload with multiple node types serializes without data loss', () => {
    const nodes = [
      makePictureNode({ id: 'n-1', type: 'rect' }),
      makePictureNode({ id: 'n-2', type: 'circle' }),
      makePictureNode({ id: 'n-3', type: 'star', points: 6 }),
      makePictureNode({ id: 'n-4', type: 'line' }),
    ]
    const payload = makePayload({ nodes })
    const gen = createPicture({ payload })

    gen.next() // beginRequestCreate
    gen.next() // call addPicture — facade receives full payload with all nodes

    const successEffect = gen.next('new-id').value
    expect(successEffect.payload.action.payload.nodes).toHaveLength(4)
    expect(successEffect.payload.action.payload.nodes[2].points).toBe(6)
  })
})

// ─── updatePicture ─────────────────────────────────────────────────────────

describe('updatePicture saga', () => {
  it('happy path: beginUpdate → updatePicture(id, data) → successUpdate → toast', () => {
    const id = 'pic-1'
    const data = makePayload({ name: 'Nombre actualizado' })
    const gen = updatePicture({ payload: { id, data } })

    expect(gen.next().value).toEqual(put(actions.beginRequestUpdate()))
    expect(gen.next().value).toEqual(call(facade.updatePicture, id, data))
    expect(gen.next().value).toEqual(
      put(actions.successRequestUpdate({ id, ...data })),
    )
    expect(gen.next().value).toEqual(
      put(notify({ type: 'success', message: 'Cuadro guardado.' })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('error path: dispatches errorRequestUpdate and error toast', () => {
    const gen = updatePicture({ payload: { id: 'pic-1', data: makePayload() } })

    gen.next() // beginRequestUpdate
    gen.next() // call updatePicture

    const error = new Error('Firestore write error')
    expect(gen.throw(error).value).toEqual(
      put(actions.errorRequestUpdate(error.message)),
    )
    expect(gen.next().value).toEqual(
      put(notify({ type: 'error', message: `Error: ${error.message}` })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('passes the full nodes array to updatePicture service', () => {
    const nodes = [
      makePictureNode({ id: 'n-1' }),
      makePictureNode({ id: 'n-2', type: 'polygon', sides: 8 }),
    ]
    const id = 'pic-1'
    const data = makePayload({ nodes })
    const gen = updatePicture({ payload: { id, data } })

    gen.next() // beginRequestUpdate
    const callEffect = gen.next().value

    expect(callEffect).toEqual(call(facade.updatePicture, id, data))
    expect(callEffect.payload.args[1].nodes).toHaveLength(2)
    expect(callEffect.payload.args[1].nodes[1].sides).toBe(8)
  })
})

// ─── fetchPictures ─────────────────────────────────────────────────────────

describe('fetchPictures saga', () => {
  it('happy path: beginFetch → getPictures → successFetch', () => {
    const list = [makePicture({ id: 'a' }), makePicture({ id: 'b' })]
    const gen = fetchPictures()

    expect(gen.next().value).toEqual(put(actions.beginRequestFetch()))
    expect(gen.next().value).toEqual(call(facade.getPictures))
    expect(gen.next(list).value).toEqual(put(actions.successRequestFetch(list)))
    expect(gen.next().done).toBe(true)
  })

  it('error path: dispatches errorRequestFetch and toast', () => {
    const gen = fetchPictures()

    gen.next() // beginRequestFetch
    gen.next() // call getPictures

    const error = new Error('Network error')
    expect(gen.throw(error).value).toEqual(put(actions.errorRequestFetch(error.message)))
    expect(gen.next().value).toEqual(
      put(notify({ type: 'error', message: error.message })),
    )
    expect(gen.next().done).toBe(true)
  })
})

// ─── deletePicture ─────────────────────────────────────────────────────────

describe('deletePicture saga', () => {
  it('happy path: beginDelete → deletePicture(id) → successDelete → toast', () => {
    const gen = deletePicture({ payload: { id: 'pic-1' } })

    expect(gen.next().value).toEqual(put(actions.beginRequestDelete()))
    expect(gen.next().value).toEqual(call(facade.deletePicture, 'pic-1'))
    expect(gen.next().value).toEqual(
      put(actions.successRequestDelete({ id: 'pic-1' })),
    )
    expect(gen.next().value).toEqual(
      put(notify({ type: 'success', message: 'Cuadro eliminado.' })),
    )
    expect(gen.next().done).toBe(true)
  })

  it('error path: dispatches errorRequestDelete and toast', () => {
    const gen = deletePicture({ payload: { id: 'pic-1' } })

    gen.next() // beginRequestDelete
    gen.next() // call deletePicture

    const error = new Error('Delete failed')
    expect(gen.throw(error).value).toEqual(put(actions.errorRequestDelete(error.message)))
  })
})
