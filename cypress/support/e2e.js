// ── Custom commands ────────────────────────────────────────────────────────────

/**
 * Logs in once and caches the session (cookies + localStorage) so subsequent
 * tests in the same spec skip the login network round-trip.
 */
Cypress.Commands.add('login', () => {
  cy.session(
    'auth',
    () => {
      cy.visit('/login')
      cy.get('input[autocomplete="username"]').type(Cypress.env('USERNAME'))
      cy.get('input[autocomplete="current-password"]').type(Cypress.env('PASSWORD'))
      cy.get('.login-page__btn').click()
      cy.url({ timeout: 15000 }).should('not.include', '/login')
    },
    {
      cacheAcrossSpecs: true,
    },
  )
})

/**
 * Navigate to settlements and wait for the page to be ready.
 */
Cypress.Commands.add('goToSettlements', () => {
  cy.visit('/taxis/settlements')
  cy.get('.card-header', { timeout: 20000 }).contains('Liquidaciones').should('be.visible')
  // Wait for data grid or audit table to be present (data loaded)
  cy.get('.card-body', { timeout: 20000 }).should('be.visible')
})

/**
 * Switch view mode by clicking the correct header button.
 * @param {'detail'|'driver'|'vehicle'|'audit'} mode
 */
Cypress.Commands.add('switchViewMode', (mode) => {
  const labels = {
    detail: 'Detallado',
    driver: 'Por conductor',
    vehicle: 'Por vehículo',
    audit: 'Auditoría',
  }
  cy.get('.card-header button').contains(labels[mode]).click({ force: true })
})
