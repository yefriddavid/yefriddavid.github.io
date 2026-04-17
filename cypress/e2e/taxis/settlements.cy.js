/**
 * Settlements (Liquidaciones) — E2E + screenshot tests
 *
 * Each describe block targets a specific feature area.
 * cy.login() uses cy.session() internally → only one real login per spec run.
 * Screenshots are taken after reaching key UI states for visual regression.
 */

// ── Shared setup ───────────────────────────────────────────────────────────────

const setup = () => {
  cy.login()
  cy.viewport('macbook-15')
  cy.goToSettlements()
}

// ── 1. Carga inicial ───────────────────────────────────────────────────────────

describe('Liquidaciones — carga inicial', () => {
  beforeEach(setup)

  it('muestra el título de la página', () => {
    cy.get('.card-header').contains('Liquidaciones de taxis').should('be.visible')
  })

  it('muestra el botón "Nueva liquidación"', () => {
    cy.get('.card-header').contains('Nueva liquidación').should('be.visible')
  })

  it('muestra los controles de período (mes y año)', () => {
    cy.get('.card-header').find('select').should('have.length.gte', 2)
  })

  it('muestra los botones de modo de vista', () => {
    cy.get('.card-header').contains('Detallado').should('be.visible')
    cy.get('.card-header').contains('Por conductor').should('be.visible')
    cy.get('.card-header').contains('Por vehículo').should('be.visible')
    cy.get('.card-header').contains('Auditoría').should('be.visible')
  })

  it('carga en vista Detallado por defecto y muestra la grilla', () => {
    cy.get('.dx-datagrid').should('be.visible')
  })

  it('screenshot — estado inicial', () => {
    cy.screenshot('settlements/01-initial-state')
  })
})

// ── 2. Modos de vista ─────────────────────────────────────────────────────────

describe('Liquidaciones — modos de vista', () => {
  beforeEach(setup)

  it('vista Detallado: muestra dx-datagrid con columnas de fecha y conductor', () => {
    cy.switchViewMode('detail')
    cy.get('.dx-datagrid').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Fecha').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Conductor').should('be.visible')
    cy.screenshot('settlements/02-view-detail')
  })

  it('vista Por conductor: muestra dx-datagrid con columna Conductor', () => {
    cy.switchViewMode('driver')
    cy.get('.dx-datagrid').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Conductor').should('be.visible')
    cy.screenshot('settlements/03-view-by-driver')
  })

  it('vista Por vehículo: muestra dx-datagrid con columna Placa', () => {
    cy.switchViewMode('vehicle')
    cy.get('.dx-datagrid').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Placa').should('be.visible')
    cy.screenshot('settlements/04-view-by-vehicle')
  })

  it('vista Auditoría: muestra tabla con columnas Día y Estado', () => {
    cy.switchViewMode('audit')
    cy.get('table').should('be.visible')
    cy.contains('th', 'Día').should('be.visible')
    cy.contains('th', 'Estado').should('be.visible')
    cy.screenshot('settlements/05-view-audit')
  })

  it('el botón activo cambia de estilo al cambiar de modo', () => {
    cy.switchViewMode('driver')
    cy.get('.card-header button')
      .contains('Por conductor')
      .should('have.css', 'font-weight')
      .and('match', /700|bold/)
  })

  it('volver a Detallado desde Auditoría restaura la grilla', () => {
    cy.switchViewMode('audit')
    cy.get('table').should('be.visible')
    cy.switchViewMode('detail')
    cy.get('.dx-datagrid').should('be.visible')
  })
})

// ── 3. Selector de período ────────────────────────────────────────────────────

describe('Liquidaciones — selector de período', () => {
  beforeEach(setup)

  it('cambia el mes seleccionado', () => {
    cy.get('.card-header').find('select').eq(0).select('Enero')
    cy.get('.card-header').find('select').eq(0).should('have.value', '1')
  })

  it('cambia el año seleccionado al primer año disponible', () => {
    cy.get('.card-header')
      .find('select')
      .eq(1)
      .find('option')
      .then((opts) => {
        const firstYear = opts[0].value
        cy.get('.card-header').find('select').eq(1).select(firstYear)
        cy.get('.card-header').find('select').eq(1).should('have.value', firstYear)
      })
  })

  it('persiste el período en localStorage tras cambio de mes', () => {
    cy.get('.card-header').find('select').eq(0).select('Marzo')
    cy.window().then((win) => {
      const stored = JSON.parse(win.localStorage.getItem('settlements_period') || '{}')
      expect(stored.month).to.eq(3)
    })
  })

  it('screenshot — período cambiado a Enero', () => {
    cy.get('.card-header').find('select').eq(0).select('Enero')
    cy.screenshot('settlements/06-period-january')
  })
})

// ── 4. Formulario de creación ─────────────────────────────────────────────────

describe('Liquidaciones — formulario de creación', () => {
  beforeEach(setup)

  it('abre el formulario al hacer clic en "Nueva liquidación"', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({ force: true })
    cy.get('form').should('be.visible')
    cy.screenshot('settlements/07-create-form-open')
  })

  it('el botón cambia a "Cancelar" mientras el formulario está abierto', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({ force: true })
    cy.get('.card-header').contains('Cancelar').should('be.visible')
  })

  it('muestra los campos requeridos del formulario', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({ force: true })
    cy.get('form').within(() => {
      cy.get('select, input').should('have.length.gte', 4)
    })
  })

  it('muestra error de validación al enviar formulario vacío', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({ force: true })
    cy.get('form').find('button[type="submit"]').click()
    cy.contains('Todos los campos son requeridos').should('be.visible')
    cy.screenshot('settlements/08-create-form-validation-error')
  })

  it('cierra el formulario al hacer clic en "Cancelar"', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({ force: true })
    cy.get('form').should('be.visible')
    cy.get('.card-header').find('button').contains('Cancelar').click({ force: true })
    cy.get('form').should('not.exist')
  })

  it('el formulario no existe antes de abrirlo', () => {
    cy.get('form').should('not.exist')
  })
})

// ── 5. Resumen del período ────────────────────────────────────────────────────

describe('Liquidaciones — resumen del período', () => {
  beforeEach(setup)

  it('el panel "Resumen del período" es visible en la página', () => {
    cy.contains('Resumen del período').should('be.visible')
  })

  it('abre el panel de resumen al hacer clic en el encabezado', () => {
    cy.get('.card').contains('Resumen del período').click({ force: true })
    cy.contains('Total liquidado').should('be.visible')
    cy.screenshot('settlements/09-period-summary-open')
  })

  it('muestra la proyección del mes al abrir el resumen', () => {
    cy.get('.card').contains('Resumen del período').click({ force: true })
    cy.contains('Proyección').should('be.visible')
  })

  it('persiste el estado del resumen en localStorage', () => {
    cy.get('.card').contains('Resumen del período').click({ force: true })
    cy.window().then((win) => {
      expect(win.localStorage.getItem('settlements_summaryOpen')).to.eq('true')
    })
  })

  it('colapsa el panel al hacer clic nuevamente', () => {
    // Abre
    cy.get('.card').contains('Resumen del período').click({ force: true })
    cy.contains('Total liquidado').should('be.visible')
    // Cierra
    cy.get('.card').contains('Resumen del período').click({ force: true })
    cy.contains('Total liquidado').should('not.be.visible')
  })
})

// ── 6. Filtros de datos ───────────────────────────────────────────────────────

describe('Liquidaciones — filtros de datos', () => {
  beforeEach(setup)

  it('muestra el badge con el conteo de registros filtrados', () => {
    cy.get('.badge, [class*="badge"]').should('exist')
  })

  it('el filtro de placa es un select visible en la cabecera', () => {
    cy.get('.card-header').find('select, [class*="select"]').should('have.length.gte', 2)
  })

  it('screenshot — filtros visibles en Detallado', () => {
    cy.switchViewMode('detail')
    cy.screenshot('settlements/10-filters-detail-mode')
  })
})

// ── 7. Vista de auditoría ─────────────────────────────────────────────────────

describe('Liquidaciones — vista de auditoría', () => {
  beforeEach(() => {
    setup()
    cy.switchViewMode('audit')
  })

  it('muestra la tabla de auditoría con filas de días', () => {
    cy.get('table tbody tr').should('have.length.gte', 1)
  })

  it('la primera columna contiene números de día (1-31)', () => {
    cy.get('table tbody tr').first().find('td').first().invoke('text').then((text) => {
      const day = parseInt(text.trim(), 10)
      expect(day).to.be.gte(1).and.lte(31)
    })
  })

  it('muestra la columna "Faltantes" en la cabecera', () => {
    cy.contains('th', 'Faltantes').should('be.visible')
  })

  it('tiene al menos una fila con estado visible', () => {
    cy.get('table tbody tr').first().contains(/Completo|Parcial|Sin liquidaciones|Futuro/).should('exist')
  })

  it('muestra botones de exportación (Excel / PDF)', () => {
    cy.contains('Excel').should('be.visible')
    cy.contains('PDF').should('be.visible')
  })

  it('screenshot — vista de auditoría completa', () => {
    cy.screenshot('settlements/11-audit-view-full')
  })

  it('permite agregar una nota de auditoría si hay botón disponible', () => {
    cy.get('body').then(($body) => {
      const btn = $body.find('button[title="Agregar nota"], button[title="Editar nota"]')
      if (btn.length > 0) {
        cy.wrap(btn).first().click({ force: true })
        cy.get('input[placeholder="Motivo..."]').should('be.visible').type('Nota de prueba{enter}')
        cy.get('input[placeholder="Motivo..."]').should('not.exist')
        cy.contains('Nota de prueba').should('be.visible')
        cy.screenshot('settlements/12-audit-note-saved')
      }
    })
  })
})

// ── 8. Comportamiento responsive ──────────────────────────────────────────────

describe('Liquidaciones — responsive', () => {
  beforeEach(() => {
    cy.login()
    cy.viewport('iphone-x')
    cy.goToSettlements()
  })

  it('muestra el título en mobile', () => {
    cy.contains('Liquidaciones').should('be.visible')
    cy.screenshot('settlements/13-mobile-view')
  })

  it('muestra el botón de nueva liquidación en mobile', () => {
    cy.contains('Nueva liquidación').should('be.visible')
  })
})

// ── 9. Persistencia de preferencias ──────────────────────────────────────────

describe('Liquidaciones — persistencia en localStorage', () => {
  beforeEach(setup)

  it('persiste el modo de vista al cambiar a Por conductor', () => {
    cy.switchViewMode('driver')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('settlements_viewMode')).to.eq('driver')
    })
  })

  it('restaura el modo de vista al recargar la página', () => {
    cy.switchViewMode('vehicle')
    cy.reload()
    cy.get('.card-header', { timeout: 15000 }).contains('Liquidaciones').should('be.visible')
    cy.get('.dx-datagrid').should('be.visible')
    cy.window().then((win) => {
      expect(win.localStorage.getItem('settlements_viewMode')).to.eq('vehicle')
    })
  })
})
