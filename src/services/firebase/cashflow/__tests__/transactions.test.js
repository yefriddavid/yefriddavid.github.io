import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDocs } from 'firebase/firestore'
import { getTransactions } from '../transactions'

vi.mock('../../settings', () => ({
  db: {},
  COL_CASHFLOW_TRANSACTIONS: 'CashFlow_Transactions',
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'collectionRef'),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn((...args) => args),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn((field, op, value) => ({ field, op, value })),
}))

vi.mock('../../firebaseClient', () => ({
  firestoreCall: vi.fn((op) => op()),
}))

vi.mock('src/services/tenantContext', () => ({
  getTenantId: () => 'tenant-1',
}))

const makeSnap = (docs) => ({ docs })
const makeDoc = (id, data) => ({ id, data: () => data })

describe('getTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no args → single unfiltered query, sorted by date desc', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      makeSnap([
        makeDoc('a', { date: '2026-01-05' }),
        makeDoc('b', { date: '2026-03-01' }),
        makeDoc('c', { date: '2026-02-10' }),
      ]),
    )

    const result = await getTransactions()

    expect(getDocs).toHaveBeenCalledTimes(1)
    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('year only → single query, filtered client-side to that year', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      makeSnap([
        makeDoc('a', { date: '2025-12-20' }),
        makeDoc('b', { date: '2026-06-15' }),
        makeDoc('c', { date: '2027-01-02' }),
      ]),
    )

    const result = await getTransactions({ year: 2026 })

    expect(getDocs).toHaveBeenCalledTimes(1)
    expect(result.map((r) => r.id)).toEqual(['b'])
  })

  it('month only, no debtAccountIds → single period query, no debt query', async () => {
    vi.mocked(getDocs).mockResolvedValueOnce(
      makeSnap([makeDoc('a', { date: '2026-08-03', accountMonth: '2026-08' })]),
    )

    const result = await getTransactions({ month: '2026-08' })

    expect(getDocs).toHaveBeenCalledTimes(1)
    expect(result.map((r) => r.id)).toEqual(['a'])
  })

  it('month + debtAccountIds → merges period results with full debt history, deduped', async () => {
    // Period query: one normal payment (x) this month, plus one debt payment (y) also this month.
    vi.mocked(getDocs).mockResolvedValueOnce(
      makeSnap([
        makeDoc('x', { date: '2026-08-05', accountMonth: '2026-08', accountMasterId: 'normal-1' }),
        makeDoc('y', { date: '2026-08-10', accountMonth: '2026-08', accountMasterId: 'debt-1' }),
      ]),
    )
    // Debt query: full history for debt-1, including a payment from a prior month.
    vi.mocked(getDocs).mockResolvedValueOnce(
      makeSnap([
        makeDoc('y', { date: '2026-08-10', accountMonth: '2026-08', accountMasterId: 'debt-1' }),
        makeDoc('z', { date: '2026-05-01', accountMonth: '2026-05', accountMasterId: 'debt-1' }),
      ]),
    )

    const result = await getTransactions({ month: '2026-08', debtAccountIds: ['debt-1'] })

    expect(getDocs).toHaveBeenCalledTimes(2)
    // 'y' appears in both result sets but must only be counted once.
    expect(result.map((r) => r.id).sort()).toEqual(['x', 'y', 'z'])
  })

  it('chunks debtAccountIds into groups of 30 for the Firestore "in" filter', async () => {
    const ids = Array.from({ length: 35 }, (_, i) => `debt-${i}`)

    vi.mocked(getDocs).mockResolvedValueOnce(makeSnap([])) // period query
    vi.mocked(getDocs).mockResolvedValueOnce(makeSnap([])) // debt chunk 1 (30 ids)
    vi.mocked(getDocs).mockResolvedValueOnce(makeSnap([])) // debt chunk 2 (5 ids)

    await getTransactions({ month: '2026-08', debtAccountIds: ids })

    expect(getDocs).toHaveBeenCalledTimes(3)
  })
})
