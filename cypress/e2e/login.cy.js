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

  it('submits form when pressing Enter key', () => {
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(`${PASSWORD}{enter}`)
    
    cy.url({ timeout: 15000 }).should('not.include', '/login')
  })

  it('manages "Remember Me" cookies correctly', () => {
    // Fill and check "Recordar sesión"
    cy.get('input[autocomplete="username"]').type('test_user')
    cy.get('input[autocomplete="current-password"]').type('test_pass')
    cy.get('.login-page__remember-check').check()
    
    // Verify cookies are set (they are set on change in Login.js)
    cy.getCookie('username').should('have.property', 'value', 'test_user')
    cy.getCookie('password').should('have.property', 'value', 'test_pass')
    
    // Uncheck and verify cookies are deleted
    cy.get('.login-page__remember-check').uncheck()
    cy.getCookie('username').should('be.null')
    cy.getCookie('password').should('be.null')
  })

  it('populates localStorage with session data after successful login', () => {
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()

    cy.url({ timeout: 15000 }).should('not.include', '/login')

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null
      expect(win.localStorage.getItem('sessionId')).to.not.be.null
      expect(win.localStorage.getItem('landingPage')).to.not.be.null
      expect(win.localStorage.getItem('username')).to.eq(USERNAME)
    })
  })

  it('performs a successful logout', () => {
    // Login first
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')

    // Open user dropdown and click Logout
    // CoreUI Header dropdown usually has a class or specific structure
    cy.get('.nav-item.dropdown').find('img').click() // click avatar
    cy.contains('Logout').click()

    // Should redirect to login
    cy.url().should('include', '/login')
    
    // Check localStorage is cleaned (AVATAR_KEY and likely other things)
    cy.window().its('localStorage').invoke('getItem', 'username').should('be.null')
  })

  it('shows password placeholder and type correctly', () => {
    cy.get('input[autocomplete="current-password"]')
      .should('have.attr', 'type', 'password')
      .should('have.attr', 'placeholder', '••••••••')
  })
})
