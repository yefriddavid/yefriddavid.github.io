import React from 'react'
import PeriodSummary from 'src/views/taxis/Settlements/Components/PeriodSummary'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BY_VEHICLE = [
  { plate: 'ABC123', count: 20, total: 1000000 },
  { plate: 'XYZ789', count: 18, total: 900000 },
]

const BY_DRIVER = [
  { driver: 'Juan Perez', count: 20, total: 1000000, remaining: 0, future: 500000 },
  { driver: 'Carlos López', count: 18, total: 900000, remaining: 100000, future: 400000 },
]

const EXPENSES = [
  {
    id: 'e1',
    date: '2024-03-05',
    description: 'Combustible',
    category: 'Combustible',
    plate: 'ABC123',
    amount: 80000,
  },
  {
    id: 'e2',
    date: '2024-03-10',
    description: 'Repuesto frenos',
    category: 'Mantenimiento',
    plate: null,
    amount: 120000,
  },
]

const PENDING_ROWS = [
  {
    date: '2024-03-20',
    plate: 'ABC123',
    driver: 'Juan Perez',
    amount: 50000,
    isHoliday: false,
    isSunday: false,
  },
  {
    date: '2024-03-24',
    plate: 'XYZ789',
    driver: 'Carlos López',
    amount: 45000,
    isHoliday: false,
    isSunday: true,
  },
  {
    date: '2024-03-25',
    plate: 'ABC123',
    driver: 'Juan Perez',
    amount: 50000,
    isHoliday: true,
    isSunday: false,
  },
]

const defaultProps = {
  summaryOpen: true,
  toggleSummary: () => {},
  total: 1900000,
  projection: 2500000,
  isCurrentPeriod: true,
  daysElapsed: 15,
  daysInMonth: 31,
  totalExpenses: 200000,
  periodExpenses: EXPENSES,
  byDriver: BY_DRIVER,
  byVehicle: BY_VEHICLE,
  totalExpensesPaid: 80000,
  settlementAbbr: 'L',
  pendingRows: PENDING_ROWS,
  now: new Date('2024-03-16T12:00:00'),
  period: { month: 3, year: 2024 },
  loading: false,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PeriodSummary', () => {
  // ── Header / collapse toggle ───────────────────────────────────────────────

  describe('header and collapse', () => {
    it('shows "Resumen del período" header', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('Resumen del período').should('be.visible')
    })

    it('clicking the header calls toggleSummary', () => {
      const toggle = cy.stub().as('toggle')
      cy.mount(<PeriodSummary {...defaultProps} toggleSummary={toggle} />)
      cy.contains('Resumen del período').click()
      cy.get('@toggle').should('have.been.calledOnce')
    })

    it('hides summary cards when summaryOpen is false', () => {
      cy.mount(<PeriodSummary {...defaultProps} summaryOpen={false} />)
      // CCollapse renders <div class="collapse"> (no "show") → display:none
      cy.get('.collapse').should('not.have.class', 'show')
    })

    it('shows summary cards when summaryOpen is true', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('Total liquidado').should('be.visible')
    })
  })

  // ── Summary cards ─────────────────────────────────────────────────────────

  describe('summary cards', () => {
    beforeEach(() => cy.mount(<PeriodSummary {...defaultProps} />))

    it('shows total formatted in COP (1.900.000)', () => {
      cy.contains('1.900.000').should('be.visible')
    })

    it('shows projection formatted in COP (2.500.000)', () => {
      cy.contains('2.500.000').should('be.visible')
    })

    it('shows "si todos pagaran" subtext next to projection', () => {
      cy.contains('si todos pagaran').should('be.visible')
    })

    it('shows total expenses (200.000)', () => {
      cy.contains('200.000').should('be.visible')
    })

    it('shows "N gastos" button with correct count', () => {
      cy.contains('2 gastos').should('be.visible')
    })

    it('shows "N conductores" button with correct count', () => {
      cy.contains('2 conductores').should('be.visible')
    })
  })

  it('shows "—" for projection when null', () => {
    cy.mount(<PeriodSummary {...defaultProps} projection={null} />)
    cy.contains('Proyección del mes').parent().contains('—').should('be.visible')
  })

  // ── Net card ──────────────────────────────────────────────────────────────

  describe('net card', () => {
    it('net = total − totalExpensesPaid by default (1.820.000)', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      // 1900000 - 80000 = 1820000
      cy.contains('1.820.000').should('be.visible')
    })

    it('"Incluir pendientes" checkbox changes net to use totalExpenses (1.700.000)', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      // 1900000 - 200000 = 1700000
      cy.contains('Incluir pendientes').click()
      cy.contains('1.700.000').should('be.visible')
    })

    it('net turns red when result is negative', () => {
      // total(100000) - totalExpensesPaid(200000) = -100000 → red
      cy.mount(<PeriodSummary {...defaultProps} total={100000} totalExpensesPaid={200000} />)
      // "Neto" label is a <div>; its next sibling is the value <div> with the color style.
      // Browser serializes #e03131 as rgb(224, 49, 49).
      cy.contains('Neto').next()
        .should('have.attr', 'style')
        .and('match', /#e03131|rgb\(224,\s*49,\s*49\)/)
    })
  })

  // ── By-vehicle modal ──────────────────────────────────────────────────────

  describe('by-vehicle modal (total settled)', () => {
    beforeEach(() => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('Total liquidado').click()
    })

    it('opens with "Por taxi" tab', () => {
      cy.contains('Por taxi').should('be.visible')
    })

    it('lists each vehicle as a row', () => {
      cy.contains('ABC123').should('be.visible')
      cy.contains('XYZ789').should('be.visible')
    })

    it('shows each vehicle total', () => {
      cy.contains('1.000.000').should('be.visible')
      cy.contains('900.000').should('be.visible')
    })

    it('shows the footer aggregate total', () => {
      cy.get('tfoot').contains('1.900.000').should('be.visible')
    })

    it('closes with the close button', () => {
      cy.get('.btn-close').first().click({ force: true })
      cy.contains('Por taxi').should('not.exist')
    })
  })

  // ── Expenses modal ────────────────────────────────────────────────────────

  describe('expenses modal', () => {
    beforeEach(() => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('2 gastos').click()
    })

    it('opens the expenses modal with all rows', () => {
      cy.contains('Combustible').should('be.visible')
      cy.contains('Repuesto frenos').should('be.visible')
    })

    it('all rows start fully opaque (checked)', () => {
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('have.css', 'opacity', '1')
      })
    })

    it('clicking a row makes it dimmed (opacity 0.4)', () => {
      cy.get('tbody tr').first().click()
      cy.get('tbody tr').first().should('have.css', 'opacity', '0.4')
    })

    it('clicking a dimmed row restores it (opacity 1)', () => {
      cy.get('tbody tr').first().click() // dim
      cy.get('tbody tr').first().click() // restore
      cy.get('tbody tr').first().should('have.css', 'opacity', '1')
    })

    it('footer total updates when a row is unchecked', () => {
      // initial checked total = 80000 + 120000 = 200000
      cy.get('tfoot').contains('200.000').should('be.visible')
      // uncheck first row (80000) → total = 120000
      cy.get('tbody tr').first().click()
      cy.get('tfoot').contains('120.000').should('be.visible')
    })

    it('shows "—" for null plate', () => {
      cy.contains('—').should('exist')
    })
  })

  // ── By-driver modal ───────────────────────────────────────────────────────

  describe('by-driver modal', () => {
    it('opens with driver rows', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('2 conductores').click()
      cy.contains('Juan Perez').should('be.visible')
      cy.contains('Carlos López').should('be.visible')
    })

    it('shows "Por cobrar" and "Resta del mes" columns when isCurrentPeriod=true', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('2 conductores').click()
      cy.contains('Por cobrar').should('be.visible')
      cy.contains('Resta del mes').should('be.visible')
    })

    it('hides "Por cobrar"/"Resta del mes" when isCurrentPeriod=false', () => {
      cy.mount(<PeriodSummary {...defaultProps} isCurrentPeriod={false} />)
      cy.contains('2 conductores').click()
      // Check the table headers inside the modal specifically
      cy.get('th').contains('Por cobrar').should('not.exist')
      cy.get('th').contains('Resta del mes').should('not.exist')
    })

    it('shows settlement count with abbreviation', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('2 conductores').click()
      cy.contains('20 L').should('be.visible')
    })

    it('shows footer aggregate across all drivers', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('2 conductores').click()
      cy.get('tfoot').contains('1.900.000').should('be.visible')
    })
  })

  // ── Pending modal ─────────────────────────────────────────────────────────

  describe('pending modal', () => {
    it('pending card shows "--" when not current period', () => {
      cy.mount(<PeriodSummary {...defaultProps} isCurrentPeriod={false} />)
      cy.contains('Por cobrar (conductores)').parent().contains('--').should('exist')
    })

    it('opens pending modal with all pending rows', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('3 pendientes').click()
      cy.contains('Liquidaciones pendientes').should('be.visible')
      cy.contains('Juan Perez').should('be.visible')
      cy.contains('Carlos López').should('be.visible')
    })

    it('shows "Dom" badge for Sunday rows', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('3 pendientes').click()
      cy.contains('Dom').should('be.visible')
    })

    it('shows "Festivo" badge for holiday rows', () => {
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('3 pendientes').click()
      cy.contains('Festivo').should('be.visible')
    })

    it('shows days remaining text', () => {
      // now = 2024-03-16, daysInMonth=31 → 31-16 = 15 días restantes
      cy.mount(<PeriodSummary {...defaultProps} />)
      cy.contains('15 días restantes').should('be.visible')
    })
  })
})
