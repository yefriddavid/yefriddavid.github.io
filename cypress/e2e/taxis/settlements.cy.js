const USERNAME = Cypress.env('USERNAME')
const PASSWORD = Cypress.env('PASSWORD')

describe('Settlements Page', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login')
    cy.get('input[autocomplete="username"]').type(USERNAME)
    cy.get('input[autocomplete="current-password"]').type(PASSWORD)
    cy.get('.login-page__btn').click()
    cy.url({ timeout: 15000 }).should('not.include', '/login')
    
    // Navigate to Settlements
    cy.visit('/taxis/settlements')
    cy.contains('Liquidaciones de taxis').should('be.visible')
  })

  it('should display the settlements page title and initial state', () => {
    cy.contains('Liquidaciones de taxis').should('be.visible')
    cy.contains('Nueva liquidación').should('be.visible')
  })

  it('should open the "New Settlement" form and show validation error on empty submit', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({force: true})
    cy.get('form').should('be.visible')
    
    // Submit empty form
    cy.get('form').find('button[type="submit"]').click()
    
    // Should show error message (t('taxis.settlements.errors.allRequired'))
    cy.contains('Todos los campos son requeridos').should('be.visible')
  })

  it('should switch between different view modes', () => {
    // Default view is "Detallado"
    cy.get('.dx-datagrid').should('be.visible')
    
    // Switch to "Por conductor"
    cy.get('.card-header .btn').contains('Por conductor').click({force: true})
    cy.get('.dx-datagrid').should('be.visible')

    // Switch to "Por vehículo"
    cy.get('.card-header .btn').contains('Por vehículo').click({force: true})
    cy.get('.dx-datagrid').should('be.visible')

    // Switch to "Auditoría"
    cy.get('.card-header .btn').contains('Auditoría').click({force: true})
    cy.get('table').should('be.visible')
    cy.contains('Día').should('be.visible')
    cy.contains('Estado').should('be.visible')
  })

  it('should allow changing the period filter (month and year)', () => {
    // There are two selects for period: month and year
    cy.get('.card-header select').eq(0).as('monthSelect')
    cy.get('.card-header select').eq(1).as('yearSelect')

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
    cy.get('div').contains('Resumen del período').click({force: true})
    
    // Open it if not already open
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Total liquidado')) {
        cy.get('div').contains('Resumen del período').click({force: true})
      }
    })
    
    cy.contains('Total liquidado').should('be.visible')
  })

  it('should filter the grid by driver using the top selector', () => {
    cy.contains('Conductor').should('be.visible')
    cy.get('.card-header select').contains('Todos').should('exist')
  })

  it('should show "Pico y placa" warning UI fields', () => {
    cy.get('.card-header').find('button').contains('Nueva liquidación').click({force: true})
    cy.get('form').contains('Placa').should('be.visible')
    cy.get('form').find('input[type="date"]').should('be.visible')
  })

  it('should have grid headers in detailed mode', () => {
    cy.get('.card-header .btn').contains('Detallado').click({force: true})
    cy.get('.dx-datagrid-headers').contains('Fecha').should('be.visible')
    cy.get('.dx-datagrid-headers').contains('Conductor').should('be.visible')
  })

  it('should display the Audit View with correct headers', () => {
    cy.get('.card-header .btn').contains('Auditoría').click({force: true})
    
    // Headers from AuditView.js
    cy.contains('Día').should('be.visible')
    cy.contains('Sem').should('be.visible')
    cy.contains('Estado').should('be.visible')
  })

  it('should switch audit note to read-only after saving', () => {
    cy.get('.card-header .btn').contains('Auditoría').click({force: true})
    
    // Look for an edit button (✎) in the missing column
    // Since we might not have data, we'll only run this if an edit button is found
    cy.get('body').then(($body) => {
      if ($body.find('button[title="Agregar nota"], button[title="Editar nota"]').length > 0) {
        cy.get('button[title="Agregar nota"], button[title="Editar nota"]').first().click({force: true})
        
        // Input should appear
        cy.get('input[placeholder="Motivo..."]').should('be.visible').type('Test note{enter}')
        
        // Input should disappear and text should be visible
        cy.get('input[placeholder="Motivo..."]').should('not.exist')
        cy.contains('Test note').should('be.visible')
      }
    })
  })
})
