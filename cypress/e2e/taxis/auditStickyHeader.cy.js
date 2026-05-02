/**
 * Audit view — sticky column header E2E test
 *
 * Verifies that when the user scrolls to the vertical middle of the page
 * in audit mode, the sticky header row is visible above the table content.
 */

describe('Auditoría — sticky header al hacer scroll', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.viewport('macbook-15')
    cy.goToSettlements()
    cy.switchViewMode('audit')
    cy.get('table tbody tr', { timeout: 15000 }).should('have.length.gte', 1)
  })

  it('no existe el sticky header antes de hacer scroll', () => {
    cy.get('[data-testid="audit-sticky-header"]').should('not.exist')
  })

  it('muestra el sticky header al hacer scroll a la mitad de la página', () => {
    // Sticky header must be absent at the start
    cy.get('[data-testid="audit-sticky-header"]').should('not.exist')

    // Scroll to the vertical middle of the scrollable content
    cy.scrollTo(0, '50%', { duration: 300 })

    // Allow the rAF loop (useStickyAuditHeader) to detect the change
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400)

    // Log actual dimensions for diagnosis
    cy.get('[data-testid="audit-sticky-header"]')
      .should('exist')
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect()
        const ths = $el[0].querySelectorAll('th')
        const colWidths = Array.from(ths).map((th) => th.getBoundingClientRect().width)
        cy.log(`sticky header — top:${rect.top} height:${rect.height} width:${rect.width}`)
        cy.log(`th count: ${ths.length} | colWidths: ${JSON.stringify(colWidths)}`)
        cy.log(`th texts: ${Array.from(ths).map((th) => th.textContent.trim()).join(' | ')}`)

        // Element must be positioned in the top bar area
        expect(rect.top, 'top is below app header').to.be.gte(49)
        expect(rect.top, 'top is above content area').to.be.lt(120)
        // Header row must have real height (padding + text ≥ 30px)
        expect(rect.height, 'header has real height').to.be.gt(30)
        // Header must span most of the viewport width
        expect(rect.width, 'header spans viewport').to.be.gt(300)
        // All th must have text content
        ths.forEach((th) => {
          expect(th.textContent.trim(), `column "${th.textContent.trim()}" has text`).to.not.be.empty
        })
      })

    // Must contain column headers
    cy.get('[data-testid="audit-sticky-header"] th').should('have.length.gte', 5)

    cy.screenshot('audit-sticky-header/visible-at-mid-scroll', { capture: 'viewport' })
  })

  it('oculta el sticky header al volver al inicio', () => {
    cy.scrollTo(0, '50%', { duration: 300 })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400)

    cy.get('[data-testid="audit-sticky-header"]').should('exist')

    cy.scrollTo(0, 0, { duration: 300 })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400)

    cy.get('[data-testid="audit-sticky-header"]').should('not.exist')

    cy.screenshot('audit-sticky-header/hidden-after-scroll-top', { capture: 'viewport' })
  })
})
