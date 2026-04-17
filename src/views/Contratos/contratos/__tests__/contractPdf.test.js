import { describe, it, expect, vi } from 'vitest'
import { buildContractHtml } from '../contractPdf'

// Mock html2canvas since it's not needed for testing the HTML builder
vi.mock('html2canvas', () => ({
  default: vi.fn()
}))

describe('contractPdf Logic', () => {
  const mockPayload = {
    tenant: { full_name: 'PEDRO PEREZ', identification: { number: '123', city: 'BOGOTA' } },
    owner: { full_name: 'JUAN DUQUE' },
    property: { full_address: 'Calle 100', city: 'Medellín', state: 'Antioquia' },
    rental: { value: '1000000', duration: '12', start_date: '2024-01-01' },
    contract: { city: 'Medellín', date: '2024-01-01' },
    account: { bank_name: 'Bancolombia', type: 'ahorros', number: '001' }
  }

  it('should generate HTML containing key data', () => {
    const html = buildContractHtml(mockPayload)
    
    expect(html).toContain('CONTRATO DE ARRENDAMIENTO')
    expect(html).toContain('PEDRO PEREZ')
    expect(html).toContain('JUAN DUQUE')
    expect(html).toContain('UN MILLÓN') 
    expect(html).toContain('Calle 100')
  })
})
