const SLUG = 'empanadas-demo'

describe('Public menu', () => {
  beforeEach(() => {
    cy.clearCart(SLUG)
    cy.visit(`/r/${SLUG}`)
  })

  it('displays the restaurant name', () => {
    cy.contains('h1', 'Empanadas Demo').should('be.visible')
  })

  it('shows categories with products', () => {
    cy.contains('h2', 'Empanadas Clásicas').should('be.visible')
    cy.contains('Carne Picante').should('be.visible')
    cy.contains('Jamón y Queso').should('be.visible')
  })

  it('shows product price', () => {
    cy.contains('Carne Picante').closest('[style]').within(() => {
      cy.contains('$').should('be.visible')
    })
  })

  it('cart button is hidden when cart is empty', () => {
    cy.contains('🛒').should('not.exist')
  })

  it('adds a product to the cart', () => {
    cy.contains('Carne Picante').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').should('be.visible')
    cy.contains('1 —').should('be.visible')
  })

  it('adds multiple products and updates the cart count', () => {
    cy.contains('Carne Picante').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('Jamón y Queso').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('2 —').should('be.visible')
  })

  it('opens the cart drawer', () => {
    cy.contains('Humita').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Your Cart').should('be.visible')
    cy.contains('Humita').should('be.visible')
  })

  it('removes a product from the cart drawer', () => {
    cy.contains('Humita').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Your Cart').should('be.visible')
    // click the ✕ next to the item
    cy.get('[style]').contains('Humita').parent().contains('✕').click()
    cy.contains('No items').should('not.exist')
    // cart button disappears after removing last item
    cy.contains('Your Cart').should('not.exist')
  })

  it('shows the checkout modal', () => {
    cy.contains('Choclo').closest('[style]').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Checkout →').click()
    cy.contains('Checkout').should('be.visible')
    cy.get('input[type="text"]').first().should('be.visible')
  })

  it('shows "Not accepting orders" banner when restaurant is closed', () => {
    // This test assumes the API can be stubbed; skip if the restaurant is open
    cy.intercept('GET', '/api/v1/public/menu/empanadas-demo', (req) => {
      req.continue((res) => {
        res.body.restaurant.accepting_orders = false
      })
    }).as('menuApi')

    cy.visit(`/r/${SLUG}`)
    cy.wait('@menuApi')
    cy.contains('Not accepting orders').should('be.visible')
  })
})
