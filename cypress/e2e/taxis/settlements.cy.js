const USERNAME = Cypress.env('USERNAME')
const PASSWORD = Cypress.env('PASSWORD')

describe('Settlements Page', () => {
  beforeEach(() => {
    cy.viewport('macbook-15')
    // Login before each test
    cy.visit('/login')
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
    
    // Navigate to Settlements
    cy.visit('/taxis/settlements')
    cy.get('.card-header').contains('Liquidaciones de taxis').should('be.visible')
  })

  it('should display the settlements page title and initial state', () => {
    cy.get('.card-header').contains('Liquidaciones de taxis').should('be.visible')
    cy.get('.card-header').contains('Nueva liquidación').should('be.visible')
  })

  it('should open the "New Settlement" form and show validation error on empty submit', () => {
    // Click button explicitly in header
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({force: true})
    cy.get('form').should('be.visible')
    
    // Submit empty form
    cy.get('form').find('button[type="submit"]').click()
    
    // Should show error message (t('taxis.settlements.errors.allRequired'))
    cy.contains('Todos los campos son requeridos').should('be.visible')
  })

  it('should switch between different view modes using header buttons', () => {
    // Default view is "Detallado"
    cy.get('.dx-datagrid').should('be.visible')
    
    // Switch to "Por conductor"
    cy.get('.card-header button').contains('Por conductor').should('be.visible').click({force: true})
    cy.get('.dx-datagrid').should('be.visible')

    // Switch to "Por vehículo"
    cy.get('.card-header button').contains('Por vehículo').should('be.visible').click({force: true})
    cy.get('.dx-datagrid').should('be.visible')

    // Switch to "Auditoría"
    cy.get('.card-header button').contains('Auditoría').should('be.visible').click({force: true})
    cy.get('table').should('be.visible')
    cy.contains('Día').should('be.visible')
    cy.contains('Estado').should('be.visible')
  })

  it('should allow changing the period filter (month and year)', () => {
    // Selects in the header
    cy.get('.card-header').find('select').eq(0).as('monthSelect')
    cy.get('.card-header').find('select').eq(1).as('yearSelect')

    // Change month
    cy.get('@monthSelect').select('Enero')
    cy.get('@monthSelect').should('have.value', '1')

    // Change year - select the first available option
    cy.get('@yearSelect').find('option').then(options => {
      const firstYear = options[0].value
      cy.get('@yearSelect').select(firstYear)
      cy.get('@yearSelect').should('have.value', firstYear)
    })
  })

  it('should toggle the Period Summary panel', () => {
    // Targeted click
    cy.get('.card').contains('Resumen del período').click({force: true})
    
    // Check if it opened (text should be visible)
    cy.contains('Total liquidado').should('be.visible')
  })

  it('should have grid headers in detailed mode', () => {
    cy.get('.card-header button').contains('Detallado').click({force: true})
    cy.get('.dx-datagrid-headers').contains('Fecha').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Conductor').should('be.visible')
  })

  it('should switch audit note to read-only after saving', () => {
    cy.get('.card-header button').contains('Auditoría').should('be.visible').click({force: true})
    
    // Look for an edit button (✎) in the missing column
    cy.get('body').then(($body) => {
      const editBtn = $body.find('button[title="Agregar nota"], button[title="Editar nota"]')
      if (editBtn.length > 0) {
        cy.wrap(editBtn).first().click({force: true})
        
        // Input should appear
        cy.get('input[placeholder="Motivo..."]').should('be.visible').type('Test note{enter}')
        
        // Input should disappear and text should be visible
        cy.get('input[placeholder="Motivo..."]').should('not.exist')
        cy.contains('Test note').should('be.visible')
      }
    })
  })
})
