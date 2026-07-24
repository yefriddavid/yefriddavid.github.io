import { describe, it, expect, vi, beforeEach } from 'vitest'
import { doc, getDocs, updateDoc } from 'firebase/firestore'
import { updateRestrictions, getVehicles } from '../taxiVehicles'

vi.mock('../../settings', () => ({
  dbTaxi: {},
  COL_TAXI_VEHICLES: 'Taxi_vehiculos',
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
}))

vi.mock('../../firebaseClient', () => ({
  taxiCall: vi.fn((op) => op()),
}))

vi.mock('src/services/tenantContext', () => ({
  getTenantId: () => 'tenant-1',
}))

describe('taxiVehicles service — pico y placa write path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(doc).mockReturnValue('docRef')
  })

  it('updateRestrictions writes exactly the restrictions object it receives, untouched', async () => {
    const yearKeyed = {
      2026: {
        8: { d1: 9, d2: null, d3: null },
        9: { d1: 6, d2: 20, d3: null },
      },
      2027: {
        1: { d1: 4, d2: null, d3: null },
      },
    }

    await updateRestrictions('v1', yearKeyed)

    expect(updateDoc).toHaveBeenCalledWith('docRef', { restrictions: yearKeyed })
  })

  it('updateRestrictions does not mutate or reshape the payload', async () => {
    const legacyFlat = { 2: { d1: 12, d2: 26 } }
    const snapshot = JSON.parse(JSON.stringify(legacyFlat))

    await updateRestrictions('v1', legacyFlat)

    expect(legacyFlat).toEqual(snapshot)
    expect(updateDoc).toHaveBeenCalledWith('docRef', { restrictions: legacyFlat })
  })
})

describe('taxiVehicles service — read path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const makeSnap = (docs) => ({ docs })
  const makeDoc = (id, data) => ({ id, data: () => data })

  it('getVehicles passes through a year-keyed restrictions map unchanged', async () => {
    const yearKeyed = { 2026: { 8: { d1: 9, d2: null, d3: null } } }
    vi.mocked(getDocs).mockResolvedValue(
      makeSnap([makeDoc('v1', { plate: 'ABC123', restrictions: yearKeyed })]),
    )

    const result = await getVehicles()

    expect(result[0].restrictions).toEqual(yearKeyed)
  })

  it('getVehicles passes through a legacy flat restrictions map unchanged', async () => {
    const legacyFlat = { 2: { d1: 12, d2: 26 } }
    vi.mocked(getDocs).mockResolvedValue(
      makeSnap([makeDoc('v1', { plate: 'ABC123', restrictions: legacyFlat })]),
    )

    const result = await getVehicles()

    expect(result[0].restrictions).toEqual(legacyFlat)
  })

  it('getVehicles defaults restrictions to {} when the field is missing', async () => {
    vi.mocked(getDocs).mockResolvedValue(makeSnap([makeDoc('v1', { plate: 'ABC123' })]))

    const result = await getVehicles()

    expect(result[0].restrictions).toEqual({})
  })
})
