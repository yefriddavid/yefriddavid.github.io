const USERNAME = Cypress.env('USERNAME')
const PASSWORD = Cypress.env('PASSWORD')

describe('Login form', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('shows error when submitting empty fields', () => {
    cy.get('.login-page__btn').click()
    cy.contains('Ingresa usuario y contraseña').should('be.visible')
  })

  it('shows error with wrong credentials', () => {
    cy.get('input[autocomplete="username"]').type('usuario_invalido')
    cy.get('input[autocomplete="current-password"]').type('clave_invalida')
    cy.get('.login-page__btn').click()
    cy.get('.login-page__btn').should('not.contain', 'Ingresando...')
    cy.get('.login-page__card').should('be.visible')
    // still on login page
    cy.url().should('include', '/login')
  })

  it('logs in successfully with valid credentials', () => {
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()

    // button enters loading state
    cy.get('.login-page__btn').should('contain', 'Ingresando...')

    // navigates away from login after successful auth
    cy.url({ timeout: 15000 }).should('not.include', '/login')

    // localStorage is populated
    cy.window().its('localStorage').invoke('getItem', 'username').should('eq', USERNAME)
  })
})
