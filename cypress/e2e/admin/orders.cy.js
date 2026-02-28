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
          customer_email: 'cypress@test.com',
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
    cy.contains('Preparing').should('be.visible')
    cy.contains('Ready').should('be.visible')
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
          cy.contains('Start Preparing').click()
        })
      })
      cy.get('[data-testid="column-preparing"]').within(() => {
        cy.contains('[data-testid="order-card"]', 'Cypress User').within(() => {
          cy.contains('Mark Ready').click()
        })
      })
      cy.get('[data-testid="column-ready"]').within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('hides cancelled orders from active kanban columns', () => {
    const customerName = `Cypress Cancel User ${Date.now()}-${Cypress._.random(1000, 9999)}`

    seedOrder(customerName).then((orderRes) => {
      const orderId = orderRes.body.id
      cy.request('PATCH', `/api/v1/admin/orders/${orderId}`, {
        order: { status: 'cancelled' },
      })
      cy.reload()

      cy.contains('[data-testid="order-card"]', customerName).should('not.exist')
    })
  })
})
