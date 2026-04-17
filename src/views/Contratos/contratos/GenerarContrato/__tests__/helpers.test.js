import { describe, it, expect } from 'vitest'
import { formatCOP, parseCOP, buildPayload, emptyForm, fillFormFromDoc } from '../helpers'

describe('GenerarContrato Helpers', () => {
  describe('formatCOP', () => {
    it('should format numbers correctly', () => {
      expect(formatCOP(1000)).toBe('1.000')
      expect(formatCOP('1500000')).toBe('1.500.000')
    })

    it('should return empty string for invalid inputs', () => {
      expect(formatCOP('')).toBe('')
      expect(formatCOP(null)).toBe('')
    })
  })

  describe('parseCOP', () => {
    it('should remove dots from formatted string', () => {
      expect(parseCOP('1.500.000')).toBe('1500000')
      expect(parseCOP('1.000')).toBe('1000')
    })
  })

  describe('buildPayload', () => {
    it('should construct a valid payload from form data', () => {
      const form = {
        ...emptyForm,
        tenant_full_name: 'John Doe',
        rental_value: '1.200.000',
        property_city: 'Medellín'
      }
      
      const payload = buildPayload(form)
      
      expect(payload.tenant.full_name).toBe('John Doe')
      expect(payload.rental.value).toBe('1200000')
      expect(payload.property.city).toBe('Medellín')
    })
  })

  describe('fillFormFromDoc', () => {
    it('should map Firestore document to form state correctly', () => {
      const doc = {
        tenant: { full_name: 'Jane Doe', identification: { number: '456' } },
        rental: { value: '2000000' }
      }
      const form = fillFormFromDoc(doc)
      expect(form.tenant_full_name).toBe('Jane Doe')
      expect(form.tenant_identification_number).toBe('456')
      expect(form.rental_value).toBe('2.000.000') // Formatted
    })

    it('should handle null/missing fields gracefully', () => {
      const form = fillFormFromDoc({})
      expect(form.tenant_full_name).toBe('')
      expect(form.rental_value).toBe('')
    })
  })
})
