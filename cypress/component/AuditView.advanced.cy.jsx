import React from 'react'
import AuditView from 'src/views/taxis/Settlements/Components/AuditView'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const DRIVERS = ['Juan Perez', 'Carlos López', 'Mario Ríos']
const VEHICLES = ['ABC123', 'XYZ789', 'QRS456']

const FULL_RECORDS = [
  { id: 'r1', driver: 'Juan Perez', vehicle: 'ABC123', plate: 'ABC123', amount: 60000 },
  { id: 'r2', driver: 'Carlos López', vehicle: 'XYZ789', plate: 'XYZ789', amount: 40000 },
]

const makeDay = (overrides = {}) => ({
  d: 10,
  dateStr: '2024-03-10',
  status: 'full',
  count: 2,
  total: 100000,
  cumul: 100000,
  dayRecords: FULL_RECORDS,
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

const makeProps = (dayOverrides = []) => ({
  auditDays: dayOverrides.length
    ? dayOverrides
    : [
        makeDay({ d: 10, dateStr: '2024-03-10', status: 'full', dayRecords: FULL_RECORDS }),
        makeDay({
          d: 11,
          dateStr: '2024-03-11',
          status: 'partial',
          dayRecords: [FULL_RECORDS[0]],
          missing: ['Mario Ríos'],
          missingVehicles: ['QRS456'],
        }),
        makeDay({ d: 12, dateStr: '2024-03-12', status: 'none', dayRecords: [], settled: [], settledVehicles: [], missing: DRIVERS, total: 0 }),
        makeDay({ d: 15, dateStr: '2024-03-15', status: 'future', dayRecords: [], isFuture: true }),
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
  handleResolvedToggle: cy.stub(),
  handleNoteSave: cy.stub(),
  isAllResolved: () => false,
  auditRowBg: () => undefined,
  auditLeftBorder: () => undefined,
  exportAuditToExcel: cy.stub(),
  exportAuditToPdf: cy.stub(),
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuditView — advanced', () => {
  let props

  beforeEach(() => {
    props = makeProps()
    cy.mount(<AuditView {...props} />)
  })

  // ── Mode toggle (Edición / Simulacro) ──────────────────────────────────────

  describe('mode toggle', () => {
    it('renders "Edición" and "Simulacro" mode buttons', () => {
      cy.contains('Edición').should('be.visible')
      cy.contains('Simulacro').should('be.visible')
    })

    it('"Edición" is the default active mode', () => {
      // In edicion mode the footer label is "Total"
      cy.get('tfoot').contains('Total').should('be.visible')
    })

    it('switching to Simulacro changes the footer label to "~ Simulacro total"', () => {
      cy.contains('Simulacro').click()
      cy.get('tfoot').contains('~ Simulacro total').should('be.visible')
    })

    it('switching back to Edición restores the footer label', () => {
      cy.contains('Simulacro').click()
      cy.contains('Edición').click()
      cy.get('tfoot').contains('Total').should('be.visible')
      cy.get('tfoot').contains('~ Simulacro total').should('not.exist')
    })

    it('Simulacro footer has purple background', () => {
      cy.contains('Simulacro').click()
      // The main audit table is the last table; select its tfoot.
      // The browser serializes #4c1d95 as rgb(76, 29, 149).
      cy.get('tfoot').last().find('tr').first()
        .should('have.attr', 'style')
        .and('match', /#4c1d95|rgb\(76,\s*29,\s*149\)/)
    })
  })

  // ── Row expand / collapse ──────────────────────────────────────────────────

  describe('row expand / collapse', () => {
    it('clicking a row expands the day detail panel', () => {
      cy.get('table tbody tr').first().click()
      // AuditDayDetail renders the dateStr in a DetailRow
      cy.contains('2024-03-10').should('be.visible')
    })

    it('detail panel shows the status label for the day', () => {
      cy.get('table tbody tr').first().click()
      cy.contains('Completo').should('be.visible')
    })

    it('detail panel shows "Liquidaron" section when day has records', () => {
      cy.get('table tbody tr').first().click()
      // DetailSection uses <p> for its title; scope to <p> to avoid matching <th> in thead
      cy.contains('p', 'Liquidaron').should('exist')
    })

    it('detail panel shows "Sin liquidar" section when day has no records', () => {
      // Day 12 (index 2) has status none, no records
      cy.get('table tbody tr').eq(2).click()
      cy.contains('p', 'Sin liquidar').should('exist')
    })

    it('clicking the same row again collapses the detail panel', () => {
      cy.get('table tbody tr').first().click()
      cy.contains('2024-03-10').should('be.visible')
      cy.get('table tbody tr').first().click()
      cy.contains('2024-03-10').should('not.exist')
    })

    it('clicking a different row collapses the previous and expands the new one', () => {
      cy.get('table tbody tr').first().click()
      cy.contains('2024-03-10').should('be.visible')
      // After expanding row 0, a detail <tr> is inserted at index 1.
      // Day 11 is now at index 2.
      cy.get('table tbody tr').eq(2).click()
      cy.contains('2024-03-10').should('not.exist')
      cy.contains('2024-03-11').should('be.visible')
    })
  })

  // ── SettlementRow amount editing ──────────────────────────────────────────

  describe('settlement row amount editing', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click()
    })

    it('shows clickable formatted amounts in the detail panel', () => {
      // "Click para editar" is a title attribute on the amount span, not visible text
      cy.get('[title="Click para editar"]').should('exist')
    })

    it('clicking an amount enters edit mode (shows input)', () => {
      cy.contains('60.000').click()
      cy.get('input[type="number"]').should('be.visible')
    })

    it('pressing Escape resets to original value and exits edit', () => {
      cy.contains('60.000').click()
      cy.get('input[type="number"]').clear().type('99999').type('{esc}')
      cy.contains('60.000').should('be.visible')
      cy.get('input[type="number"]').should('not.exist')
    })

    it('shows "Guardar" button when amount is changed', () => {
      cy.contains('60.000').click()
      cy.get('input[type="number"]').clear().type('70000')
      cy.contains('Guardar').scrollIntoView().should('be.visible')
    })

    it('"Guardar" button not visible when amount is unchanged', () => {
      cy.contains('60.000').click()
      // blur without changing
      cy.get('input[type="number"]').blur()
      cy.contains('Guardar').should('not.exist')
    })
  })

  // ── Day badges ────────────────────────────────────────────────────────────

  describe('day badges', () => {
    it('shows "hoy" badge for the current day (isToday=true)', () => {
      const todayProps = makeProps([
        makeDay({ d: 10, dateStr: '2024-03-10', isToday: true }),
      ])
      cy.mount(<AuditView {...todayProps} />)
      cy.contains('hoy').should('be.visible')
    })

    it('shows "P&P" badge when day has pico y placa vehicles', () => {
      const ppProps = makeProps([
        makeDay({
          d: 10,
          dateStr: '2024-03-10',
          hasPicoPlaca: true,
          picoPlacaVehicles: ['ABC123'],
          picoPlacaDrivers: ['Juan Perez'],
        }),
      ])
      cy.mount(<AuditView {...ppProps} />)
      cy.contains('P&P').should('be.visible')
    })

    it('shows "Festivo" label in weekday column for holidays', () => {
      const holidayProps = makeProps([
        makeDay({
          d: 10,
          dateStr: '2024-03-10',
          isHoliday: true,
          dow: 1, // Monday
        }),
      ])
      cy.mount(<AuditView {...holidayProps} />)
      cy.contains('Festivo').should('be.visible')
    })
  })

  // ── Column manager ────────────────────────────────────────────────────────

  describe('column manager', () => {
    it('opens the column manager popup when "⊞ Columnas" is clicked', () => {
      cy.contains('⊞ Columnas').click({ force: true })
      cy.contains('Restablecer todo').should('be.visible')
    })

    it('shows a checkbox for each column definition', () => {
      cy.contains('⊞ Columnas').click({ force: true })
      // 8 column definitions
      cy.get('input[type="checkbox"]').should('have.length.gte', 8)
    })

    it('unchecking "Total" hides that column from the table header', () => {
      cy.contains('⊞ Columnas').click({ force: true })
      // find the "Total" checkbox label and uncheck it
      cy.contains('label', 'Total').find('input[type="checkbox"]').uncheck({ force: true })
      // Total header cell should be hidden
      cy.get('thead th').contains('Total').should('not.be.visible')
    })

    it('"Restablecer todo" re-enables all hidden columns', () => {
      cy.contains('⊞ Columnas').click({ force: true })
      cy.contains('label', 'Total').find('input[type="checkbox"]').uncheck({ force: true })
      cy.contains('Restablecer todo').click()
      cy.get('thead th').contains('Total').should('be.visible')
    })

    it('closes when clicking outside the popup', () => {
      cy.contains('⊞ Columnas').click({ force: true })
      cy.contains('Restablecer todo').should('be.visible')
      cy.get('body').click(0, 0)
      cy.contains('Restablecer todo').should('not.exist')
    })
  })

  // ── Driver filter (MultiSelectDropdown) ──────────────────────────────────

  describe('driver filter', () => {
    it('shows "Conductor: Todos" by default', () => {
      cy.contains('Conductor: Todos').should('be.visible')
    })

    it('clicking the driver filter opens the dropdown', () => {
      cy.contains('Conductor: Todos').click()
      cy.contains('Juan Perez').should('be.visible')
      cy.contains('Carlos López').should('be.visible')
    })

    it('selecting a driver updates the label to show the count', () => {
      cy.contains('Conductor: Todos').click()
      cy.contains('Juan Perez').click()
      cy.contains('Aceptar').click()
      cy.contains('Conductor (1)').should('be.visible')
    })

    it('filtering by one driver reduces visible rows', () => {
      cy.contains('Conductor: Todos').click()
      cy.contains('Mario Ríos').click()
      cy.contains('Aceptar').click()
      // Only day 11 (partial, missing Mario) and day 12 (none, missing all) contain Mario
      cy.get('table tbody tr').should('have.length.lte', 3)
    })
  })

  // ── Status badge rendering ─────────────────────────────────────────────────

  describe('status column badges', () => {
    it('full day shows "✓ Completo" badge', () => {
      cy.get('table tbody tr').eq(0).contains('✓').should('exist')
      cy.get('table tbody tr').eq(0).contains('Completo').should('exist')
    })

    it('partial day shows "◐ Parcial" badge', () => {
      cy.get('table tbody tr').eq(1).contains('◐').should('exist')
      cy.get('table tbody tr').eq(1).contains('Parcial').should('exist')
    })

    it('none day shows "✗ Sin actividad" badge', () => {
      cy.get('table tbody tr').eq(2).contains('✗').should('exist')
      cy.get('table tbody tr').eq(2).contains('Sin actividad').should('exist')
    })

    it('future day shows "— Futuro" badge', () => {
      cy.get('table tbody tr').eq(3).contains('Futuro').should('exist')
    })
  })
})
