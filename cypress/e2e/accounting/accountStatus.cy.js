const USERNAME = Cypress.env('USERNAME')
const PASSWORD = Cypress.env('PASSWORD')

describe('Account Status Page', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login')
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
    
    // Navigate to Account Status
    cy.visit('/cash_flow/management/account-status')
    cy.get('.card-header, body').contains(/Estado de Cuentas/i).should('be.visible')
  })

  it('should display the current year', () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    cy.contains(currentYear.toString()).should('be.visible')
  })

  it('should navigate between months', () => {
    // Go to previous month
    cy.get('button').contains('‹').click()
    cy.url().should('include', 'month=')

    // Go to next month
    cy.get('button').contains('›').click()
  })

  it('should switch between Outcoming and Incoming tabs', () => {
    // Switch to Ingresos
    cy.get('button').contains('Ingresos').click()
    cy.url().should('include', 'tab=Incoming')

    // Switch back to Egresos
    cy.get('button').contains('Egresos').click()
    cy.url().should('include', 'tab=Outcoming')
  })

  it('should display summary filters', () => {
    cy.contains('Pagadas').should('be.visible')
    cy.contains('Pendientes').should('be.visible')
    cy.contains('Vencidas').should('be.visible')
  })

  it('should toggle and use Period Notes', () => {
    cy.contains('Notas del período').click()
    
    // Should expand and show input
    cy.get('input[placeholder="Nueva nota…"]').should('be.visible')
    
    // Add a note
    const noteText = `Test note ${Date.now()}`
    cy.get('input[placeholder="Nueva nota…"]').type(`${noteText}{enter}`)
    
    // Note should appear in the list
    cy.contains(noteText).should('be.visible')
    
    // Delete the note - use more specific selector to avoid ambiguity
    cy.contains(noteText).closest('div').find('button[title="Eliminar nota"]').should('be.visible').click()
    cy.contains(noteText).should('not.exist')
  })
})
