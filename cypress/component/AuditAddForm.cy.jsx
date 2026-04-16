import React from 'react'
import AuditAddForm from 'src/views/taxis/Settlements/Components/AuditAddForm'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DRIVERS = [
  {
    id: 'd0',
    name: 'Juan Perez',
    defaultVehicle: 'ABC123',
    defaultAmount: 50000,
    defaultAmountSunday: 30000,
    startDate: null,
    endDate: null,
    active: true,
  },
  {
    id: 'd1',
    name: 'Carlos López',
    defaultVehicle: 'XYZ789',
    defaultAmount: 45000,
    defaultAmountSunday: 25000,
    startDate: null,
    endDate: null,
    active: true,
  },
  {
    id: 'd2',
    name: 'Mario Ríos',
    defaultVehicle: 'QRS456',
    defaultAmount: 55000,
    defaultAmountSunday: 35000,
    startDate: null,
    endDate: null,
    active: true,
  },
]

const makeDay = (overrides = {}) => ({
  d: 10,
  dateStr: '2024-03-10',
  isSunday: false,
  isHoliday: false,
  missingVehicles: [],
  underpaidVehicles: [],
  ...overrides,
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuditAddForm', () => {
  let onSave, onCancel

  beforeEach(() => {
    onSave = cy.stub().as('onSave')
    onCancel = cy.stub().as('onCancel')
  })

  // ── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a driver select with all active drivers', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select option').should('have.length', 3)
      cy.get('select option').eq(0).should('have.text', 'Juan Perez')
      cy.get('select option').eq(1).should('have.text', 'Carlos López')
      cy.get('select option').eq(2).should('have.text', 'Mario Ríos')
    })

    it('renders a number input for the amount', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').should('exist')
    })

    it('renders save (✓) and cancel (✕) buttons', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.contains('✓').should('exist')
      cy.contains('✕').should('exist')
    })
  })

  // ── Default values ───────────────────────────────────────────────────────────

  describe('default driver selection', () => {
    it('pre-selects the driver whose vehicle is in missingVehicles', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay({ missingVehicles: ['XYZ789'] })}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').should('have.value', 'Carlos López')
    })

    it('pre-selects the driver whose vehicle is in underpaidVehicles', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay({ underpaidVehicles: ['QRS456'] })}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').should('have.value', 'Mario Ríos')
    })

    it('falls back to first activeDriver when no missing/underpaid vehicles', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').should('have.value', 'Juan Perez')
    })
  })

  // ── Default amount ───────────────────────────────────────────────────────────

  describe('default amount', () => {
    it('pre-fills defaultAmount on a regular weekday', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').should('have.value', '50000')
    })

    it('pre-fills defaultAmountSunday on a Sunday', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay({ isSunday: true })}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').should('have.value', '30000')
    })

    it('pre-fills defaultAmountSunday on a holiday', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay({ isHoliday: true })}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').should('have.value', '30000')
    })
  })

  // ── Driver change ─────────────────────────────────────────────────────────

  describe('driver change', () => {
    it('changing driver updates amount to that driver defaultAmount', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').select('Mario Ríos')
      cy.get('input[type="number"]').should('have.value', '55000')
    })

    it('changing driver on Sunday uses that driver defaultAmountSunday', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay({ isSunday: true })}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').select('Mario Ríos')
      cy.get('input[type="number"]').should('have.value', '35000')
    })
  })

  // ── Save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('clicking ✓ calls onSave with the correct payload', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.contains('✓').click()
      cy.get('@onSave').should('have.been.calledOnce')
      cy.get('@onSave').should('have.been.calledWith', {
        driver: 'Juan Perez',
        plate: 'ABC123',
        amount: 50000,
        date: '2024-03-10',
      })
    })

    it('saves the correct driver after changing selection', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('select').select('Carlos López')
      cy.contains('✓').click()
      cy.get('@onSave').should('have.been.calledWith', {
        driver: 'Carlos López',
        plate: 'XYZ789',
        amount: 45000,
        date: '2024-03-10',
      })
    })

    it('saves a custom amount when the user edits the input', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').clear().type('70000')
      cy.contains('✓').click()
      cy.get('@onSave').should('have.been.calledWith', {
        driver: 'Juan Perez',
        plate: 'ABC123',
        amount: 70000,
        date: '2024-03-10',
      })
    })

    it('does not call onSave when amount is cleared', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.get('input[type="number"]').clear()
      cy.contains('✓').click()
      cy.get('@onSave').should('not.have.been.called')
    })
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('clicking ✕ calls onCancel', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.contains('✕').click()
      cy.get('@onCancel').should('have.been.calledOnce')
    })

    it('clicking ✕ does not call onSave', () => {
      cy.mount(
        <AuditAddForm
          day={makeDay()}
          activeDrivers={DRIVERS}
          periodDrivers={DRIVERS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      )
      cy.contains('✕').click()
      cy.get('@onSave').should('not.have.been.called')
    })
  })
})
