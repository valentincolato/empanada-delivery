const SLUG = 'empanadas-demo'

function fillCheckoutForm(customer, options = {}) {
  cy.contains('label', 'Nombre y apellido *').find('input').clear().type(options.name || customer.name)
  cy.contains('label', 'Número de teléfono *').find('input').clear().type(options.phone || customer.phone)
  cy.contains('label', 'Email *').find('input').clear().type(options.email || customer.email)
  cy.contains('label', 'Dirección de entrega *').find('input').clear().type(options.address || customer.address)

  if (options.paymentMethod === 'transfer') {
    cy.contains('label', 'Transferencia').find('input[type="radio"]').check({ force: true })
  } else {
    cy.contains('label', 'Efectivo').find('input[type="radio"]').check({ force: true })
  }

  if (options.cashChangeFor) {
    cy.contains('label', 'Necesito cambio para').find('input').clear().type(options.cashChangeFor)
  }
}

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
      fillCheckoutForm(customer, { paymentMethod: 'cash' })
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
    cy.contains('Payment: Cash').should('be.visible')
  })

  it('shows the total on the status page', () => {
    cy.contains('[data-testid="product-card"]', 'Agua Mineral').within(() => {
      cy.contains('+ Add').click()
    })

    cy.contains('🛒').click()
    cy.contains('Checkout →').click()

    cy.fixture('customer').then((customer) => {
      fillCheckoutForm(customer, { paymentMethod: 'cash' })
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
    cy.fixture('customer').then((customer) => {
      fillCheckoutForm(customer, {
        name: 'Test User',
        paymentMethod: 'cash'
      })
    })
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
      fillCheckoutForm(c, { paymentMethod: 'cash' })
    })
    cy.contains('Place Order').click()

    cy.url().should('match', /\/orders\//)
    cy.contains('Updates automatically').should('be.visible')
  })

  it('supports transfer payment and hides cash change field', () => {
    cy.contains('[data-testid="product-card"]', 'Carne Suave').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Checkout →').click()

    cy.fixture('customer').then((customer) => {
      fillCheckoutForm(customer, { paymentMethod: 'transfer' })
    })

    cy.contains('Necesito cambio para').should('not.exist')
    cy.contains('Place Order').click()

    cy.url().should('match', /\/orders\/[0-9a-f-]{36}/)
    cy.contains('Payment: Bank transfer').should('be.visible')
    cy.contains('Cash change for').should('not.exist')
  })

  it('supports cash change request for cash payments', () => {
    cy.contains('[data-testid="product-card"]', 'Carne Suave').within(() => {
      cy.contains('+ Add').click()
    })
    cy.contains('🛒').click()
    cy.contains('Checkout →').click()

    cy.fixture('customer').then((customer) => {
      fillCheckoutForm(customer, {
        paymentMethod: 'cash',
        cashChangeFor: '10000'
      })
    })

    cy.contains('Place Order').click()
    cy.url().should('match', /\/orders\/[0-9a-f-]{36}/)
    cy.contains('Payment: Cash').should('be.visible')
    cy.contains('Cash change for: $10000.00').should('be.visible')
  })
})
