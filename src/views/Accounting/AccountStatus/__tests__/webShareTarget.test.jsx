// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// ── Hoisted spies — must be created before vi.mock factories run ───────────────
const { mockGetPendingShare, mockClearPendingShare, ocrProps } = vi.hoisted(() => ({
  mockGetPendingShare: vi.fn(),
  mockClearPendingShare: vi.fn(),
  // Mutable object that the mocked OcrReceiptImporter writes its props into
  ocrProps: { initialFile: undefined },
}))

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('src/services/idb/pendingShare', () => ({
  getPendingShare: mockGetPendingShare,
  clearPendingShare: mockClearPendingShare,
}))

// OcrReceiptImporter: capture latest props so we can assert on initialFile
vi.mock('src/views/Accounting/OcrReceiptImporter/OcrReceiptImporter', () => ({
  default: (props) => {
    ocrProps.initialFile = props.initialFile
    return <div data-testid="ocr-importer" />
  },
}))

vi.mock('@coreui/react', () => ({
  CSpinner: () => <span />,
  CModal: ({ children, visible }) => (visible ? <div>{children}</div> : null),
  CModalHeader: ({ children }) => <div>{children}</div>,
  CModalTitle: ({ children }) => <div>{children}</div>,
  CModalBody: ({ children }) => <div>{children}</div>,
}))
vi.mock('@coreui/icons-react', () => ({ default: () => null }))
vi.mock('@coreui/icons', () => ({ cilCalendar: null }))
vi.mock('src/utils/moment', () => ({
  default: { localeData: () => ({ months: () => Array.from({ length: 12 }, (_, i) => String(i)) }) },
}))
vi.mock('src/hooks/useLocaleData', () => ({
  default: () => ({ monthLabels: Array.from({ length: 12 }, (_, i) => `Mes${i + 1}`) }),
}))
vi.mock('src/components/shared/AttachmentViewer', () => ({ default: () => null }))
vi.mock('src/utils/fileHelpers', () => ({ processAttachmentFile: vi.fn() }))

const mockDispatch = vi.fn()
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}))

const mockSetSearchParams = vi.fn()
vi.mock('react-router-dom', () => ({ useSearchParams: vi.fn() }))

vi.mock('src/actions/cashflow/transactionActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'TX_FETCH' })),
  createRequest: vi.fn(() => ({ type: 'TX_CREATE' })),
  updateRequest: vi.fn(() => ({ type: 'TX_UPDATE' })),
  deleteRequest: vi.fn(() => ({ type: 'TX_DELETE' })),
}))
vi.mock('src/actions/cashflow/accountsMasterActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'ACC_FETCH' })),
  createRequest: vi.fn(() => ({ type: 'ACC_CREATE' })),
  updateRequest: vi.fn(() => ({ type: 'ACC_UPDATE' })),
}))
vi.mock('src/actions/cashflow/accountStatusNoteActions', () => ({
  fetchRequest: vi.fn(() => ({ type: 'NOTE_FETCH' })),
  createRequest: vi.fn(() => ({ type: 'NOTE_CREATE' })),
  updateRequest: vi.fn(() => ({ type: 'NOTE_UPDATE' })),
  deleteRequest: vi.fn(() => ({ type: 'NOTE_DELETE' })),
}))

vi.mock('../DetailModal', () => ({ default: () => null }))
vi.mock('../PayModal', () => ({ default: () => null }))
vi.mock('../AccountCard', () => ({ default: () => null }))
vi.mock('../AdHocExpenseModal', () => ({ default: () => null }))
vi.mock('../AdHocSection', () => ({ default: () => <div /> }))
vi.mock('../PeriodNotes', () => ({ default: () => null }))

// ── Imports (after mocks) ──────────────────────────────────────────────────────
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import AccountStatus from '../index'

// ── Helpers ────────────────────────────────────────────────────────────────────

const baseState = {
  transaction: { data: [], fetching: false, saving: false },
  accountsMaster: { data: [], fetching: false, saving: false },
  accountStatusNote: { notes: [], fetching: false, saving: false },
  profile: { data: { tenantId: 'tenant1' }, fetching: false },
}

function setupStore(overrides = {}) {
  useSelector.mockImplementation((sel) => sel({ ...baseState, ...overrides }))
}

function setupUrl(extra = {}) {
  const sp = new URLSearchParams({ tab: 'Outcoming', month: '4', year: '2024', ...extra })
  useSearchParams.mockReturnValue([sp, mockSetSearchParams])
}

function fakeIdbEntry(overrides = {}) {
  return {
    buffer: new TextEncoder().encode('img-bytes').buffer,
    type: 'image/jpeg',
    name: 'receipt.jpg',
    ...overrides,
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AccountStatus — Web Share Target (?share= param)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ocrProps.initialFile = undefined
    setupStore()
    setupUrl()
    mockGetPendingShare.mockResolvedValue(null)
    mockClearPendingShare.mockResolvedValue(undefined)
  })

  describe('no ?share= in URL', () => {
    it('does not call getPendingShare', async () => {
      render(<AccountStatus />)
      await waitFor(() => {})
      expect(mockGetPendingShare).not.toHaveBeenCalled()
    })

    it('OcrReceiptImporter receives no initialFile', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(screen.getByTestId('ocr-importer')).toBeTruthy())
      expect(ocrProps.initialFile).toBeNull()
    })
  })

  describe('?share=<timestamp> present, IDB empty', () => {
    beforeEach(() => {
      setupUrl({ share: '1700000000000' })
      mockGetPendingShare.mockResolvedValue(null)
    })

    it('calls getPendingShare', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalled())
    })

    it('does not call clearPendingShare', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalled())
      expect(mockClearPendingShare).not.toHaveBeenCalled()
    })

    it('OcrReceiptImporter still receives no initialFile', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalled())
      expect(ocrProps.initialFile).toBeNull()
    })

    it('does not remove ?share= from URL when nothing was read', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalled())
      // setSearchParams should NOT have been called (no entry consumed)
      expect(mockSetSearchParams).not.toHaveBeenCalled()
    })
  })

  describe('?share=<timestamp> present, IDB has entry', () => {
    beforeEach(() => {
      setupUrl({ share: '1700000000000' })
      mockGetPendingShare.mockResolvedValue(fakeIdbEntry())
    })

    it('calls clearPendingShare after reading', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockClearPendingShare).toHaveBeenCalled())
    })

    it('passes a File as initialFile to OcrReceiptImporter', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(ocrProps.initialFile).toBeInstanceOf(File))
    })

    it('reconstructed File has correct name and type', async () => {
      setupUrl({ share: '1700000000000' })
      mockGetPendingShare.mockResolvedValue(fakeIdbEntry({ type: 'image/png', name: 'whatsapp.png' }))
      render(<AccountStatus />)
      await waitFor(() => expect(ocrProps.initialFile).toBeInstanceOf(File))
      expect(ocrProps.initialFile.name).toBe('whatsapp.png')
      expect(ocrProps.initialFile.type).toBe('image/png')
    })

    it('removes ?share= param from URL', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled())

      const updateFn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '4', year: '2024', share: '1700000000000' })
      updateFn(sp)
      expect(sp.has('share')).toBe(false)
    })

    it('preserves other URL params when removing ?share=', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled())

      const updateFn = mockSetSearchParams.mock.calls[0][0]
      const sp = new URLSearchParams({ tab: 'Outcoming', month: '5', year: '2025', share: '1700000000000' })
      updateFn(sp)
      expect(sp.get('tab')).toBe('Outcoming')
      expect(sp.get('month')).toBe('5')
      expect(sp.get('year')).toBe('2025')
    })

    it('calls setSearchParams with { replace: true } to avoid polluting history', async () => {
      render(<AccountStatus />)
      await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled())
      expect(mockSetSearchParams.mock.calls[0][1]).toEqual({ replace: true })
    })
  })

  describe('?share= param changes while already on AccountStatus', () => {
    it('re-reads IDB when shareToken changes (simulates SW redirect to same route)', async () => {
      // Initial render: no share param — effect does nothing
      render(<AccountStatus />)
      await waitFor(() => {})
      expect(mockGetPendingShare).not.toHaveBeenCalled()

      // SW now redirects with ?share= — simulate via useSearchParams update
      mockGetPendingShare.mockResolvedValue(fakeIdbEntry())
      setupUrl({ share: '1700000000999' })

      const { rerender } = render(<AccountStatus />)
      rerender(<AccountStatus />)

      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalled())
    })

    it('does not re-read IDB when shareToken stays the same across renders', async () => {
      setupUrl({ share: '1700000000000' })
      const { rerender } = render(<AccountStatus />)
      await waitFor(() => expect(mockGetPendingShare).toHaveBeenCalledTimes(1))

      // Same share token — useEffect([shareToken]) should NOT fire again
      rerender(<AccountStatus />)
      await waitFor(() => {})
      expect(mockGetPendingShare).toHaveBeenCalledTimes(1)
    })
  })
})
