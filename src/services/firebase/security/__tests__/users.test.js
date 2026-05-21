import { describe, it, expect, vi, beforeEach } from 'vitest'
import { doc, getDoc } from 'firebase/firestore'
import { firestoreCall } from '../../firebaseClient'
import { hashPassword, getUserForAuth } from '../users'

vi.mock('src/services/firebase/settings', () => ({
  db: {},
  COL_USERS: 'Users',
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
}))

vi.mock('../../firebaseClient', () => ({
  firestoreCall: vi.fn(),
}))

describe('hashPassword', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await hashPassword('secret')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('same input always produces the same hash', async () => {
    const a = await hashPassword('password123')
    const b = await hashPassword('password123')
    expect(a).toBe(b)
  })

  it('different inputs produce different hashes', async () => {
    const a = await hashPassword('abc')
    const b = await hashPassword('xyz')
    expect(a).not.toBe(b)
  })

  it('matches the known SHA-256 of "test"', async () => {
    const hash = await hashPassword('test')
    expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08')
  })
})

describe('getUserForAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user object with username as id when doc exists', async () => {
    const fakeSnap = {
      exists: () => true,
      id: 'jperez',
      data: () => ({ name: 'Juan Perez', role: 'manager', passwordHash: 'abc123', active: true }),
    }
    vi.mocked(firestoreCall).mockResolvedValue(fakeSnap)
    vi.mocked(doc).mockReturnValue('docRef')
    vi.mocked(getDoc).mockResolvedValue(fakeSnap)

    const result = await getUserForAuth('jperez')

    expect(result).toEqual({
      username: 'jperez',
      name: 'Juan Perez',
      role: 'manager',
      passwordHash: 'abc123',
      active: true,
    })
  })

  it('returns null when doc does not exist', async () => {
    const fakeSnap = { exists: () => false }
    vi.mocked(firestoreCall).mockResolvedValue(fakeSnap)
    vi.mocked(doc).mockReturnValue('docRef')

    const result = await getUserForAuth('ghost')

    expect(result).toBeNull()
  })

  it('calls firestoreCall (not getDoc directly)', async () => {
    const fakeSnap = { exists: () => false }
    vi.mocked(firestoreCall).mockResolvedValue(fakeSnap)

    await getUserForAuth('anyuser')

    expect(firestoreCall).toHaveBeenCalledTimes(1)
  })
})
