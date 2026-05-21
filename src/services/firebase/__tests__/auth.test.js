import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { getUserForAuth, hashPassword, updatePassword as updatePasswordHash } from '../security/users'
import { createSession } from '../security/sessions'
import { clearTenantId } from 'src/services/tenantContext'
import { authStorage } from 'src/utils/storage'

// ── Hoisted mutable auth instance ────────────────────────────────────────────

const mockAuth = vi.hoisted(() => ({ currentUser: null }))

vi.mock('src/services/firebase/settings', () => ({ auth: mockAuth }))

// ── Firebase Auth ──────────────────────────────────────────────────────────────

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: { credential: vi.fn() },
}))

// ── Users service ──────────────────────────────────────────────────────────────

vi.mock('../security/users', () => ({
  getUserForAuth: vi.fn(),
  hashPassword: vi.fn(),
  updatePassword: vi.fn(),
}))

// ── Sessions service ──────────────────────────────────────────────────────────

vi.mock('../security/sessions', () => ({
  createSession: vi.fn(),
}))

// ── Side-effect dependencies ──────────────────────────────────────────────────

vi.mock('src/services/tenantContext', () => ({
  clearTenantId: vi.fn(),
}))

vi.mock('src/utils/storage', () => ({
  authStorage: { clearSession: vi.fn() },
}))

// ── Import subject under test AFTER mocks ────────────────────────────────────

import { toAuthEmail, signIn, signOut, getToken, forceTokenRefresh, changePassword } from '../auth'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROFILE = { username: 'jperez', name: 'Juan Perez', role: 'manager', active: true, landingPage: '/dashboard' }

const makeMockUser = (token = 'id-token-123') => ({
  getIdToken: vi.fn().mockResolvedValue(token),
})

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.currentUser = null
  vi.mocked(createSession).mockResolvedValue(undefined)
  vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({})
})

// ── toAuthEmail ────────────────────────────────────────────────────────────────

describe('toAuthEmail', () => {
  it('appends @cashflow.app domain', () => {
    expect(toAuthEmail('dave')).toBe('dave@cashflow.app')
  })

  it('lowercases the username', () => {
    expect(toAuthEmail('DAVE')).toBe('dave@cashflow.app')
  })

  it('trims surrounding whitespace', () => {
    expect(toAuthEmail('  dave  ')).toBe('dave@cashflow.app')
  })
})

// ── signIn ─────────────────────────────────────────────────────────────────────

describe('signIn', () => {
  describe('Firebase Auth path (happy)', () => {
    it('returns user profile on successful Firebase sign-in', async () => {
      const mockUser = makeMockUser()
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = mockUser
      vi.mocked(getUserForAuth).mockResolvedValue(PROFILE)

      const result = await signIn('jperez', 'pass123')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'jperez@cashflow.app', 'pass123')
      expect(result.username).toBe('jperez')
      expect(result.role).toBe('manager')
      expect(result.token).toBe('id-token-123')
    })

    it('uses the landingPage from the Firestore profile', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = makeMockUser()
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, landingPage: '/taxi/dashboard' })

      const result = await signIn('jperez', 'pass')

      expect(result.landingPage).toBe('/taxi/dashboard')
    })

    it('defaults landingPage to /finance/dashboard when profile has none', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = makeMockUser()
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, landingPage: undefined })

      const result = await signIn('jperez', 'pass')

      expect(result.landingPage).toBe('/finance/dashboard')
    })

    it('creates a Firestore session record', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = makeMockUser()
      vi.mocked(getUserForAuth).mockResolvedValue(PROFILE)

      await signIn('jperez', 'pass')

      expect(createSession).toHaveBeenCalledTimes(1)
    })

    it('throws "Perfil no encontrado" when Firestore has no user doc', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = makeMockUser()
      vi.mocked(getUserForAuth).mockResolvedValue(null)

      await expect(signIn('ghost', 'pass')).rejects.toThrow('Perfil no encontrado')
    })

    it('throws "Usuario inactivo" when profile is inactive', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({})
      mockAuth.currentUser = makeMockUser()
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, active: false })

      await expect(signIn('jperez', 'pass')).rejects.toThrow('Usuario inactivo')
    })

    it('throws "Credenciales incorrectas" on Firebase wrong-password', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/wrong-password' })

      await expect(signIn('jperez', 'wrong')).rejects.toThrow('Credenciales incorrectas')
    })

    it('re-throws Firebase error message for unexpected codes', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/network-failed', message: 'Network error' })

      await expect(signIn('jperez', 'pass')).rejects.toThrow('Network error')
    })
  })

  describe('Legacy Firestore fallback path', () => {
    const LEGACY_ERROR = { code: 'auth/user-not-found' }

    it('returns user on successful legacy hash check and auto-migrates', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(LEGACY_ERROR)
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, passwordHash: 'stored-hash' })
      vi.mocked(hashPassword).mockResolvedValue('stored-hash')
      mockAuth.currentUser = makeMockUser()

      const result = await signIn('jperez', 'pass')

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'jperez@cashflow.app', 'pass')
      expect(result.username).toBe('jperez')
    })

    it('throws "Credenciales incorrectas" on legacy wrong password', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(LEGACY_ERROR)
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, passwordHash: 'stored-hash' })
      vi.mocked(hashPassword).mockResolvedValue('different-hash')

      await expect(signIn('jperez', 'wrong')).rejects.toThrow('Credenciales incorrectas')
    })

    it('throws "Credenciales incorrectas" when user not in Firestore', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(LEGACY_ERROR)
      vi.mocked(getUserForAuth).mockResolvedValue(null)

      await expect(signIn('ghost', 'pass')).rejects.toThrow('Credenciales incorrectas')
    })

    it('throws "Usuario inactivo" when legacy user is inactive', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(LEGACY_ERROR)
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, active: false, passwordHash: 'h' })

      await expect(signIn('jperez', 'pass')).rejects.toThrow('Usuario inactivo')
    })

    it('also handles auth/invalid-credential code as legacy path', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/invalid-credential' })
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, passwordHash: 'h' })
      vi.mocked(hashPassword).mockResolvedValue('h')
      mockAuth.currentUser = makeMockUser()

      const result = await signIn('jperez', 'pass')

      expect(result.username).toBe('jperez')
    })
  })
})

// ── signOut ────────────────────────────────────────────────────────────────────

describe('signOut', () => {
  it('calls Firebase signOut', async () => {
    vi.mocked(firebaseSignOut).mockResolvedValue(undefined)

    await signOut()

    expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth)
  })

  it('calls clearTenantId and authStorage.clearSession', async () => {
    vi.mocked(firebaseSignOut).mockResolvedValue(undefined)

    await signOut()

    expect(clearTenantId).toHaveBeenCalled()
    expect(authStorage.clearSession).toHaveBeenCalled()
  })

  it('completes even if Firebase signOut throws', async () => {
    vi.mocked(firebaseSignOut).mockRejectedValue(new Error('network'))

    await expect(signOut()).resolves.not.toThrow()
    expect(clearTenantId).toHaveBeenCalled()
  })
})

// ── getToken ───────────────────────────────────────────────────────────────────

describe('getToken', () => {
  it('returns null when no user is signed in', async () => {
    mockAuth.currentUser = null

    expect(await getToken()).toBeNull()
  })

  it('returns the ID token from the current user', async () => {
    mockAuth.currentUser = makeMockUser('my-token')

    expect(await getToken()).toBe('my-token')
  })
})

// ── forceTokenRefresh ──────────────────────────────────────────────────────────

describe('forceTokenRefresh', () => {
  it('returns null when no user is signed in', async () => {
    mockAuth.currentUser = null

    expect(await forceTokenRefresh()).toBeNull()
  })

  it('calls getIdToken(true) to force a network refresh', async () => {
    const mockUser = { getIdToken: vi.fn().mockResolvedValue('refreshed-token') }
    mockAuth.currentUser = mockUser

    const token = await forceTokenRefresh()

    expect(mockUser.getIdToken).toHaveBeenCalledWith(true)
    expect(token).toBe('refreshed-token')
  })
})

// ── changePassword ─────────────────────────────────────────────────────────────

describe('changePassword', () => {
  describe('Firebase Auth session (currentUser present)', () => {
    it('reauthenticates and updates Firebase password', async () => {
      mockAuth.currentUser = makeMockUser()
      const fakeCredential = { type: 'email' }
      vi.mocked(EmailAuthProvider.credential).mockReturnValue(fakeCredential)
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(undefined)
      vi.mocked(firebaseUpdatePassword).mockResolvedValue(undefined)
      vi.mocked(updatePasswordHash).mockResolvedValue(undefined)

      await changePassword('jperez', 'old', 'new123')

      expect(EmailAuthProvider.credential).toHaveBeenCalledWith('jperez@cashflow.app', 'old')
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockAuth.currentUser, fakeCredential)
      expect(firebaseUpdatePassword).toHaveBeenCalledWith(mockAuth.currentUser, 'new123')
    })

    it('keeps the Firestore hash in sync after Firebase update', async () => {
      mockAuth.currentUser = makeMockUser()
      vi.mocked(EmailAuthProvider.credential).mockReturnValue({})
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(undefined)
      vi.mocked(firebaseUpdatePassword).mockResolvedValue(undefined)
      vi.mocked(updatePasswordHash).mockResolvedValue(undefined)

      await changePassword('jperez', 'old', 'new123')

      expect(updatePasswordHash).toHaveBeenCalledWith('jperez', 'new123')
    })
  })

  describe('Legacy session (no currentUser)', () => {
    it('verifies hash against Firestore and updates on match', async () => {
      mockAuth.currentUser = null
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, passwordHash: 'current-hash' })
      vi.mocked(hashPassword).mockResolvedValue('current-hash')
      vi.mocked(updatePasswordHash).mockResolvedValue(undefined)

      await changePassword('jperez', 'old', 'new123')

      expect(updatePasswordHash).toHaveBeenCalledWith('jperez', 'new123')
    })

    it('throws "Contraseña actual incorrecta" on wrong current password', async () => {
      mockAuth.currentUser = null
      vi.mocked(getUserForAuth).mockResolvedValue({ ...PROFILE, passwordHash: 'stored-hash' })
      vi.mocked(hashPassword).mockResolvedValue('wrong-hash')

      await expect(changePassword('jperez', 'bad', 'new')).rejects.toThrow('Contraseña actual incorrecta')
    })

    it('throws "Usuario no encontrado" when user profile is missing', async () => {
      mockAuth.currentUser = null
      vi.mocked(getUserForAuth).mockResolvedValue(null)

      await expect(changePassword('ghost', 'old', 'new')).rejects.toThrow('Usuario no encontrado')
    })
  })
})
