const ADMIN_EMAIL = 'demo@empanada.dev'
const ADMIN_PASSWORD = 'password123'

describe('Admin — Products Manager', () => {
  beforeEach(() => {
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    cy.visit('/admin/products')
  })

  it('displays the products list', () => {
    cy.get('[data-testid="products-title"]').should('be.visible')
    cy.get('[data-testid^="product-row-"]').should('have.length.greaterThan', 0)
  })

  it('opens the new product modal', () => {
    cy.get('[data-testid="new-product-button"]').click()
    cy.get('[data-testid="product-modal-title"][data-mode="new"]').should('be.visible')
    cy.get('[data-testid="product-name-input"]').should('be.focused')
  })

  it('creates a new product', () => {
    const productName = `Test Product Cypress ${Date.now()}`

    cy.get('[data-testid="new-product-button"]').click()
    cy.get('[data-testid="product-name-input"]').type(productName)
    cy.get('[data-testid="product-price-input"]').type('999')
    cy.get('[data-testid="save-product-button"]').click()
    cy.contains(productName).should('be.visible')
  })

  it('edits an existing product', () => {
    const updatedName = `Cypress Edited ${Date.now()}`

    cy.get('[data-testid^="product-row-"]', { timeout: 10000 }).first().within(() => {
      cy.get('[data-testid^="edit-product-"]').click()
    })
    cy.get('[data-testid="product-modal-title"][data-mode="edit"]', { timeout: 10000 }).should('be.visible')
    cy.get('[data-testid="product-name-input"]').clear().type(updatedName)
    cy.get('[data-testid="save-product-button"]').click()
    cy.contains('tr', updatedName, { timeout: 10000 }).should('be.visible')
  })

  it('toggles product availability', () => {
    cy.get('[data-testid^="product-row-"]').first().within(() => {
      cy.get('[data-testid^="toggle-availability-"]').first().then(($btn) => {
        const testId = $btn.attr('data-testid')
        const before = $btn.attr('data-available')
        cy.get(`[data-testid="${testId}"]`).click()
        cy.get(`[data-testid="${testId}"]`).should(($after) => {
          expect($after.attr('data-available')).not.to.eq(before)
        })
      })
    })
  })

  it('cancels modal without saving', () => {
    cy.get('[data-testid="new-product-button"]').click()
    cy.get('[data-testid="cancel-product-button"]').click()
    cy.get('[data-testid="product-modal-title"]').should('not.exist')
  })
})
