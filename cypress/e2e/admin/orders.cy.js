const ADMIN_EMAIL = 'demo@empanada.dev'
const ADMIN_PASSWORD = 'password123'
const SLUG = 'empanadas-demo'

// Helper: place an order via the API so we have data to manage
function seedOrder() {
  return cy.request('GET', `/api/v1/public/menu/${SLUG}`).then((menuRes) => {
    const product = menuRes.body.categories[0].products[0]
    return cy.request({
      method: 'POST',
      url: '/api/v1/orders',
      body: {
        order: {
          restaurant_slug: SLUG,
          customer_name: 'Cypress User',
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
      cy.contains('Pending').parent().within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('moves an order to Confirmed', () => {
    seedOrder().then(() => {
      cy.reload()
      // Find the Cypress User card and click Confirm
      cy.contains('Cypress User').closest('[style]').within(() => {
        cy.contains('Confirm').click()
      })
      // Card should move to Confirmed column
      cy.contains('Confirmed').parent().within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('moves an order through the full pipeline', () => {
    seedOrder().then(() => {
      cy.reload()

      cy.contains('Cypress User').closest('[style]').within(() => {
        cy.contains('Confirm').click()
      })
      cy.contains('Confirmed').parent().within(() => {
        cy.contains('Cypress User').closest('[style]').within(() => {
          cy.contains('Start Preparing').click()
        })
      })
      cy.contains('Preparing').parent().within(() => {
        cy.contains('Cypress User').closest('[style]').within(() => {
          cy.contains('Mark Ready').click()
        })
      })
      cy.contains('Ready').parent().within(() => {
        cy.contains('Cypress User').should('be.visible')
      })
    })
  })

  it('can cancel an order', () => {
    seedOrder().then(() => {
      cy.reload()
      cy.contains('Cypress User').closest('[style]').within(() => {
        cy.contains('Cancel').click()
      })
      // Cancelled orders disappear from the board (no Cancelled column shown)
      cy.contains('Cypress User').should('not.exist')
    })
  })
})
