const ADMIN_EMAIL = 'demo@empanada.dev'
const ADMIN_PASSWORD = 'password123'

describe('Admin — Products Manager', () => {
  beforeEach(() => {
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    cy.visit('/admin/products')
  })

  it('displays the products list', () => {
    cy.contains('Products').should('be.visible')
    cy.contains('Carne Picante').should('be.visible')
    cy.contains('Jamón y Queso').should('be.visible')
  })

  it('opens the new product modal', () => {
    cy.contains('+ New Product').click()
    cy.contains('New Product').should('be.visible')
    cy.get('input').first().should('be.focused')
  })

  it('creates a new product', () => {
    cy.contains('+ New Product').click()
    cy.get('label').contains('Name *').next('input').type('Test Product Cypress')
    cy.get('label').contains('Price *').next('input').type('999')
    cy.contains('Save').click()
    cy.contains('Test Product Cypress').should('be.visible')
  })

  it('edits an existing product', () => {
    cy.contains('tr', 'Carne Picante').contains('Edit').click()
    cy.get('label').contains('Name *').next('input').clear().type('Carne Picante Edited')
    cy.contains('Save').click()
    cy.contains('Carne Picante Edited').should('be.visible')
    // restore original name
    cy.contains('tr', 'Carne Picante Edited').contains('Edit').click()
    cy.get('label').contains('Name *').next('input').clear().type('Carne Picante')
    cy.contains('Save').click()
  })

  it('toggles product availability', () => {
    cy.contains('tr', 'Agua Mineral').within(() => {
      cy.contains('Available').click()
      cy.contains('Unavailable').should('be.visible')
      // restore
      cy.contains('Unavailable').click()
      cy.contains('Available').should('be.visible')
    })
  })

  it('cancels modal without saving', () => {
    cy.contains('+ New Product').click()
    cy.contains('Cancel').click()
    cy.contains('New Product').should('not.exist')
  })
})
