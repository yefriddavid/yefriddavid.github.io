/**
 * Audit view — sticky column header E2E test
 *
 * Verifies that scrolling to the vertical middle of the audit page
 * shows a fixed header row with the column titles.
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

  it('muestra los títulos de columnas al hacer scroll a la mitad de la página', () => {
    cy.get('[data-testid="audit-sticky-header"]').should('not.exist')

    cy.scrollTo(0, '50%', { duration: 300 })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400)

    cy.get('[data-testid="audit-sticky-header"]')
      .should('exist')
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect()

        // Must be positioned just below the app header
        expect(rect.top, 'sticky header top').to.be.gte(40)
        expect(rect.top, 'sticky header top').to.be.lt(150)

        // Must have real height (padding + text)
        expect(rect.height, 'sticky header height').to.be.gt(25)

        // Must span most of the viewport width
        expect(rect.width, 'sticky header width').to.be.gt(300)

        // Every column th must have visible text
        const ths = Array.from($el[0].querySelectorAll('th'))
        expect(ths.length, 'number of column headers').to.be.gte(5)
        ths.forEach((th) => {
          expect(th.textContent.trim(), `column text`).to.not.be.empty
        })
      })

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
