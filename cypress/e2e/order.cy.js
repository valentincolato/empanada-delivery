const SLUG = 'empanadas-demo'

describe('Placing and tracking an order', () => {
  beforeEach(() => {
    cy.clearCart(SLUG)
    cy.visit(`/r/${SLUG}`)
  })

  it('completes the full order flow and lands on the status page', () => {
    // Add two products to the cart
    cy.contains('[data-testid="product-card"]', 'Carne Picante').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('[data-testid="product-card"]', 'Jamón y Queso').within(() => {
      cy.contains('+ Add').click()
    })

    // Open cart and proceed to checkout
    cy.contains('🛒').click()
    cy.contains('Checkout →').click()

    // Fill in customer details
    cy.fixture('customer').then((customer) => {
      cy.get('input[type="text"]').first().type(customer.name)
      cy.get('input[type="tel"]').type(customer.phone)
      cy.get('input[type="email"]').type(customer.email)
    })

    // Submit the order
    cy.contains('Place Order').click()

    // Should redirect to /orders/:token
    cy.url().should('match', /\/orders\/[0-9a-f-]{36}/)

    // Status page should show order info
    cy.contains('Empanadas Demo').should('be.visible')
    cy.contains('Pending').should('be.visible')
    cy.contains('Carne Picante').should('be.visible')
    cy.contains('Jamón y Queso').should('be.visible')
  })

  it('shows the total on the status page', () => {
    cy.contains('[data-testid="product-card"]', 'Agua Mineral').within(() => {
      cy.contains('+ Add').click()
    })

    cy.contains('🛒').click()
    cy.contains('Checkout →').click()

    cy.fixture('customer').then((customer) => {
      cy.get('input[type="text"]').first().type(customer.name)
      cy.get('input[type="email"]').type(customer.email)
    })

    cy.contains('Place Order').click()

    cy.url().should('match', /\/orders\/[0-9a-f-]{36}/)
    cy.contains('Total').should('be.visible')
    cy.contains('$').should('be.visible')
  })

  it('shows an error when the server rejects the order', () => {
    cy.intercept('POST', '/api/v1/orders', {
      statusCode: 422,
      body: { error: 'Restaurant is not accepting orders' },
    }).as('failedOrder')

    cy.contains('[data-testid="product-card"]', 'Agua Mineral').within(() => {
      cy.contains('+ Add').click()
    })

    cy.contains('🛒').click()
    cy.contains('Checkout →').click()
    cy.get('input[type="text"]').first().type('Test User')
    cy.contains('Place Order').click()

    cy.wait('@failedOrder')
    cy.contains('Restaurant is not accepting orders').should('be.visible')
  })

  it('order status page auto-refreshes', () => {
    // Verify the polling text is rendered
    cy.intercept('GET', '/api/v1/orders/*').as('statusPoll')

    cy.contains('[data-testid="product-card"]', 'Carne Suave').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Checkout →').click()
    cy.fixture('customer').then((c) => {
      cy.get('input[type="text"]').first().type(c.name)
    })
    cy.contains('Place Order').click()

    cy.url().should('match', /\/orders\//)
    cy.contains('Updates automatically').should('be.visible')
  })
})
