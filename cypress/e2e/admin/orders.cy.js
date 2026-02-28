const ADMIN_EMAIL = 'demo@empanada.dev'
const ADMIN_PASSWORD = 'password123'
const SLUG = 'empanadas-demo'

// Helper: place an order via the API so we have data to manage
function seedOrder(customerName = 'Cypress User') {
  return cy.request('GET', `/api/v1/public/menu/${SLUG}`).then((menuRes) => {
    const product = menuRes.body.categories[0].products[0]
    return cy.request({
      method: 'POST',
      url: '/api/v1/orders',
      body: {
        order: {
          restaurant_slug: SLUG,
          customer_name: customerName,
          customer_phone: '+54 11 4444-1111',
          customer_email: 'cypress@test.com',
          customer_address: 'Cypress 123',
          payment_method: 'cash',
          cash_change_for: '5000',
          items: [{ product_id: product.id, quantity: 1, notes: '' }],
        },
      },
    })
  })
}

describe('Admin — Orders Dashboard', () => {
  beforeEach(() => {
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    cy.visit('/admin/orders')
  })

  it('shows the kanban board with columns', () => {
    cy.contains('Pending').should('be.visible')
    cy.contains('Confirmed').should('be.visible')
    cy.contains('Out for delivery').should('be.visible')
    cy.contains('Delivered').should('be.visible')
  })

  it('shows nav links to other admin sections', () => {
    cy.contains('Products').should('be.visible')
    cy.contains('Categories').should('be.visible')
    cy.contains('QR Code').should('be.visible')
  })

  it('displays a new order in the Pending column', () => {
    seedOrder().then(() => {
      cy.reload()
      cy.get('[data-testid="column-pending"]').within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('moves an order to Confirmed', () => {
    seedOrder().then(() => {
      cy.reload()
      cy.get('[data-testid="column-pending"]').within(() => {
        cy.contains('[data-testid="order-card"]', 'Cypress User').within(() => {
          cy.contains('Confirm').click()
        })
      })
      // Card should move to Confirmed column
      cy.get('[data-testid="column-confirmed"]').within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('moves an order through the full pipeline', () => {
    seedOrder().then(() => {
      cy.reload()

      cy.get('[data-testid="column-pending"]').within(() => {
        cy.contains('[data-testid="order-card"]', 'Cypress User').within(() => {
          cy.contains('Confirm').click()
        })
      })
      cy.get('[data-testid="column-confirmed"]').within(() => {
        cy.contains('[data-testid="order-card"]', 'Cypress User').within(() => {
          cy.contains('Set Out for delivery').click()
        })
      })
      cy.get('[data-testid="column-out_for_delivery"]').within(() => {
        cy.contains('[data-testid="order-card"]', 'Cypress User').within(() => {
          cy.contains('Mark Delivered').click()
        })
      })
      cy.get('[data-testid="column-delivered"]').within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('shows cancel action for pending orders', () => {
    const customerName = `Cypress Cancel User ${Date.now()}-${Cypress._.random(1000, 9999)}`

    seedOrder(customerName).then(() => {
      cy.reload()

      cy.get('[data-testid="column-pending"]').within(() => {
        cy.contains('[data-testid="order-card"]', customerName).within(() => {
          cy.contains('button', 'Cancel').should('be.visible')
        })
      })
    })
  })
})
