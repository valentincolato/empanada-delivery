const ADMIN_EMAIL = 'demo@empanada.dev'
const ADMIN_PASSWORD = 'password123'

const SUPER_ADMIN_EMAIL = 'admin@empanada.dev'
const SUPER_ADMIN_PASSWORD = 'password123'

describe('Admin panel landing', () => {
  it('redirects restaurant_admin to /panel after sign in with quick links', () => {
    cy.visit('/panel/login')
    cy.get('input[name="user[email]"]').type(ADMIN_EMAIL)
    cy.get('input[name="user[password]"]').type(ADMIN_PASSWORD)
    cy.get('input[type="submit"]').click()

    cy.url().should('include', '/panel')
    cy.contains('Admin Panel').should('be.visible')
    cy.contains('Pedidos').should('be.visible')
    cy.contains('Productos').should('be.visible')
    cy.contains('Categorías').should('be.visible')
    cy.contains('QR').should('be.visible')
  })

  it('shows super admin access card on /panel', () => {
    cy.visit('/panel/login')
    cy.get('input[name="user[email]"]').type(SUPER_ADMIN_EMAIL)
    cy.get('input[name="user[password]"]').type(SUPER_ADMIN_PASSWORD)
    cy.get('input[type="submit"]').click()

    cy.url().should('include', '/panel')
    cy.contains('Super Admin').should('be.visible')
    cy.contains('Ver restaurantes').should('be.visible')
  })

  it('lets super admin enter restaurant operations from the grid', () => {
    cy.login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
    cy.visit('/super_admin/restaurants')

    cy.contains('Manage operations').first().click()

    cy.url().should('include', '/admin/orders')
    cy.contains('Orders Dashboard').should('be.visible')
  })
})
