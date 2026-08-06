// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OcrReceiptImporter from '../OcrReceiptImporter'

vi.mock('@coreui/react', () => ({
  CModal: ({ children, visible }) => (visible ? <div>{children}</div> : null),
  CModalHeader: ({ children }) => <div>{children}</div>,
  CModalTitle: ({ children }) => <div>{children}</div>,
  CModalBody: ({ children }) => <div>{children}</div>,
}))

const account = { id: 'acc1', name: 'EPM', type: 'Outcoming', category: 'Servicios', important: false }

const mockAnalyzeReceipt = vi.fn()
vi.mock('src/utils/receiptAnalyzer', () => ({
  analyzeReceipt: (...args) => mockAnalyzeReceipt(...args),
}))

const mockUploadImage = vi.fn()
vi.mock('src/services/facade/imageFacade', () => ({
  uploadImage: (...args) => mockUploadImage(...args),
}))

beforeEach(() => {
  mockAnalyzeReceipt.mockReset()
  mockUploadImage.mockReset()
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
})

describe('OcrReceiptImporter handleConfirm', () => {
  it('attaches the uploaded image to the payment payload', async () => {
    mockAnalyzeReceipt.mockResolvedValue({
      account,
      amount: 5000,
      date: '2026-01-15',
      text: 'OCR text',
      ruleLabel: 'EPM',
    })
    mockUploadImage.mockResolvedValue('data:image/jpeg;base64,FAKE')

    const onConfirm = vi.fn()
    const { container } = render(
      <OcrReceiptImporter masters={[account]} monthStr="2026-01" transactions={[]} onConfirm={onConfirm} />,
    )

    fireEvent.click(screen.getByText('📷 Leer comprobante'))

    const file = new File(['img'], 'receipt.png', { type: 'image/png' })
    const fileInput = container.querySelector('input[type="file"]')
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByText('Siguiente →'))

    const confirmButton = await screen.findByText('Registrar pago')
    fireEvent.click(confirmButton)

    await waitFor(() => expect(onConfirm).toHaveBeenCalled())

    expect(mockUploadImage).toHaveBeenCalledWith(file)
    expect(onConfirm.mock.calls[0][0]).toMatchObject({
      accountMasterId: 'acc1',
      attachment: 'data:image/jpeg;base64,FAKE',
      attachmentName: 'receipt.png',
    })
  })
})
