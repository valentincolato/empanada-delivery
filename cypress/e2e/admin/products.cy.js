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
    cy.contains('h2', 'New Product').should('be.visible')
    cy.get('input').first().should('be.focused')
  })

  it('creates a new product', () => {
    const productName = `Test Product Cypress ${Date.now()}`

    cy.contains('+ New Product').click()
    cy.get('label').contains('Name *').find('input').type(productName)
    cy.get('label').contains('Price *').find('input').type('999')
    cy.contains('Save').click()
    cy.contains(productName).should('be.visible')
  })

  it('edits an existing product', () => {
    const updatedName = `Cypress Edited ${Date.now()}`

    cy.get('tbody tr', { timeout: 10000 }).first().within(() => {
      cy.contains('button', /^Edit$/).click()
    })
    cy.contains('h2', 'Edit Product', { timeout: 10000 }).should('be.visible')
    cy.get('label').contains('Name *').find('input').clear().type(updatedName)
    cy.contains('button', 'Save').click()
    cy.contains('tr', updatedName, { timeout: 10000 }).should('be.visible')
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
    // Modal title should be gone (the "+ New Product" button text still exists, so use h2)
    cy.contains('h2', 'New Product').should('not.exist')
  })
})
