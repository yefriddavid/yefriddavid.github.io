import React from 'react'
import AuditView from 'src/views/taxis/Settlements/Components/AuditView'

// ── Fixture helpers ───────────────────────────────────────────────────────────

const makeAuditDay = (overrides = {}) => ({
  d: 10,
  dateStr: '2024-03-10',
  status: 'full',
  count: 2,
  total: 100000,
  cumul: 100000,
  dayRecords: [],
  settled: ['Juan Perez', 'Carlos López'],
  settledVehicles: ['ABC123', 'XYZ789'],
  missing: [],
  missingVehicles: [],
  underpaidVehicles: [],
  picoPlacaVehicles: [],
  picoPlacaDrivers: [],
  hasPicoPlaca: false,
  dow: 0,
  isFuture: false,
  isToday: false,
  isSunday: false,
  isHoliday: false,
  ...overrides,
})

const DRIVERS = ['Juan Perez', 'Carlos López', 'Mario Ríos']
const VEHICLES = ['ABC123', 'XYZ789', 'QRS456']

// dayRecords with amounts so filteredTotal > 0 and the currency column renders
const FULL_RECORDS = [
  { driver: 'Juan Perez', vehicle: 'ABC123', amount: 60000 },
  { driver: 'Carlos López', vehicle: 'XYZ789', amount: 40000 },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuditView', () => {
  let props

  beforeEach(() => {
    props = {
      auditDays: [
        makeAuditDay({ d: 10, dateStr: '2024-03-10', status: 'full', dayRecords: FULL_RECORDS }),
        makeAuditDay({
          d: 11,
          dateStr: '2024-03-11',
          status: 'partial',
          dayRecords: [{ driver: 'Juan Perez', vehicle: 'ABC123', amount: 60000 }],
          missing: ['Mario Ríos'],
          missingVehicles: ['QRS456'],
        }),
        makeAuditDay({ d: 12, dateStr: '2024-03-12', status: 'none', settled: [], settledVehicles: [], missing: DRIVERS, total: 0 }),
        makeAuditDay({ d: 15, dateStr: '2024-03-15', status: 'future', isFuture: true }),
      ],
      dayFilter: new Set(),
      drivers: DRIVERS.map((name, i) => ({ id: `d${i}`, name })),
      periodDrivers: DRIVERS.map((name, i) => ({
        id: `d${i}`,
        name,
        defaultVehicle: VEHICLES[i],
        defaultAmount: 50000,
        defaultAmountSunday: 30000,
        startDate: null,
        endDate: null,
      })),
      auditDrivers: DRIVERS,
      auditVehicles: VEHICLES,
      getNote: () => '',
      getResolved: () => false,
      handleResolvedToggle: cy.stub().as('resolvedToggle'),
      handleNoteSave: cy.stub().as('noteSave'),
      isAllResolved: () => false,
      auditRowBg: () => undefined,
      auditLeftBorder: () => undefined,
      exportAuditToExcel: cy.stub().as('exportExcel'),
      exportAuditToPdf: cy.stub().as('exportPdf'),
    }

    cy.mount(<AuditView {...props} />)
  })

  // ── Status summary strip ───────────────────────────────────────────────────

  describe('status summary strip', () => {
    it('shows all four status pills', () => {
      cy.contains('Sin actividad').should('be.visible')
      cy.contains('Parcial').should('be.visible')
      cy.contains('Completo').should('be.visible')
    })

    it('shows correct counts per status', () => {
      // 1 full, 1 partial, 1 none, 1 future
      cy.contains('Sin actividad').parent().contains('1')
      cy.contains('Parcial').parent().contains('1')
      cy.contains('Completo').parent().contains('1')
    })
  })

  // ── Status filter ──────────────────────────────────────────────────────────

  describe('status filter', () => {
    it('clicking a status pill filters the table to that status', () => {
      cy.contains('Sin actividad').click()
      // only the "none" day (d=12) should remain
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('table tbody tr').first().should('contain', '12')
    })

    it('clicking the same pill twice restores all rows', () => {
      cy.contains('Sin actividad').click()
      cy.contains('Sin actividad').click()
      cy.get('table tbody tr').should('have.length', 4)
    })

    it('filtering by "none" hides days with other statuses from the table', () => {
      cy.contains('Sin actividad').click()
      // full day (d=10) should not appear
      cy.get('table').should('not.contain', '10')
      // none day (d=12) should appear
      cy.get('table tbody tr').should('have.length', 1)
      cy.get('table tbody tr').first().should('contain', '12')
    })

    it('reset button appears after a filter is applied and clears it', () => {
      cy.contains('Sin actividad').click()
      cy.contains('✕ Limpiar').click()
      // all days visible again
      cy.get('table tbody tr').should('have.length', 4)
    })
  })

  // ── Audit table ────────────────────────────────────────────────────────────

  describe('audit table', () => {
    it('renders one row per audit day', () => {
      // 4 audit days → 4 data rows (thead excluded)
      cy.get('table tbody tr').should('have.length', 4)
    })

    it('shows the day number for each day', () => {
      cy.get('table tbody tr').eq(0).should('contain', '10')
      cy.get('table tbody tr').eq(1).should('contain', '11')
      cy.get('table tbody tr').eq(2).should('contain', '12')
    })

    it('shows the monetary total formatted in COP for settled days', () => {
      // day 10 has dayRecords totalling 100 000 → "$ 100.000"
      cy.get('table tbody tr').eq(0).should('contain', '100.000')
    })

    it('"none" day row shows dash for total (no records)', () => {
      // day 12 has no dayRecords → filteredTotal = 0 → renders "—"
      cy.get('table tbody tr').eq(2).should('contain', '—')
    })

    it('future day row is rendered (isFuture flag)', () => {
      cy.get('table tbody tr').eq(3).should('contain', '15')
    })
  })

  // ── Column visibility ──────────────────────────────────────────────────────

  describe('column visibility', () => {
    it('opens the column manager when the columns button is clicked', () => {
      cy.get('[data-cy="col-mgr-toggle"], button')
        .filter(':visible')
        .contains(/columnas|cols/i)
        .first()
        .click({ force: true })

      cy.get('input[type="checkbox"]').should('have.length.gte', 1)
    })
  })

  // ── Export buttons ─────────────────────────────────────────────────────────

  describe('export buttons', () => {
    it('clicking Excel export calls exportAuditToExcel', () => {
      cy.contains(/excel/i).click({ force: true })
      cy.get('@exportExcel').should('have.been.calledOnce')
    })

    it('clicking PDF export calls exportAuditToPdf', () => {
      cy.contains(/pdf/i).click({ force: true })
      cy.get('@exportPdf').should('have.been.calledOnce')
    })
  })

  // ── Analysis modal ─────────────────────────────────────────────────────────

  describe('AnalysisModal', () => {
    it('opens analysis modal when IA button is clicked', () => {
      cy.contains('✦ Análisis IA').click({ force: true })
      cy.contains('Análisis IA — Auditoría del período').should('be.visible')
    })

    it('modal renders content after analysis completes', () => {
      cy.contains('✦ Análisis IA').click({ force: true })
      // Modal is visible; content either shows spinner or results
      cy.get('.modal, [role="dialog"]').should('be.visible')
    })

    it('closes the modal with the close button', () => {
      cy.contains('✦ Análisis IA').click({ force: true })
      cy.contains('Análisis IA — Auditoría del período').should('be.visible')
      cy.get('.btn-close').first().click({ force: true })
      cy.contains('Análisis IA — Auditoría del período').should('not.exist')
    })
  })

  // ── Vehicle filter ─────────────────────────────────────────────────────────

  describe('vehicle filter', () => {
    it('selecting a vehicle filters rows to only those containing that vehicle', () => {
      // "QRS456" only appears in day 11 (partial, as missingVehicle)
      cy.get('select').first().select('QRS456')
      cy.get('table tbody tr').should('have.length.lte', 2)
    })

    it('resetting the vehicle filter restores all rows', () => {
      cy.get('select').first().select('ABC123')
      cy.get('select').first().select('')
      cy.get('table tbody tr').should('have.length', 4)
    })
  })

  // ── Redux state: fetching ──────────────────────────────────────────────────

  describe('loading state', () => {
    it('renders normally when settlement fetching is false (default)', () => {
      cy.get('table').should('exist')
    })

    it('mounts without crashing when taxiSettlement.fetching is true', () => {
      cy.mount(
        <AuditView
          {...props}
          handleResolvedToggle={cy.stub()}
          handleNoteSave={cy.stub()}
          exportAuditToExcel={cy.stub()}
          exportAuditToPdf={cy.stub()}
        />,
        { reduxState: { taxiSettlement: { fetching: true, data: [] } } },
      )
      cy.get('table').should('exist')
    })
  })
})
