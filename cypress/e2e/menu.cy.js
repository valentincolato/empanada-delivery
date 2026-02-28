const SLUG = 'empanadas-demo'

function addProductFromCard(productName) {
  cy.contains('[data-testid="product-card"]', productName).within(() => {
    cy.contains('+ Agregar').click()
  })
  cy.get('[data-testid="product-modal"]').should('be.visible')
  cy.get('[data-testid="product-modal-add"]').click()
}

describe('Public menu', () => {
  beforeEach(() => {
    cy.clearCart(SLUG)
    cy.visit(`/${SLUG}`)
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
    cy.contains('[data-testid="product-card"]', 'Carne Picante').within(() => {
      cy.contains('$').should('be.visible')
    })
  })

  it('cart button is hidden when cart is empty', () => {
    cy.contains('🛒').should('not.exist')
  })

  it('adds a product to the cart', () => {
    addProductFromCard('Carne Picante')
    cy.contains('🛒').should('be.visible')
    cy.contains('1 ítems').should('be.visible')
  })

  it('adds multiple products and updates the cart count', () => {
    addProductFromCard('Carne Picante')
    addProductFromCard('Jamón y Queso')
    cy.contains('2 ítems').should('be.visible')
  })

  it('opens the cart drawer', () => {
    addProductFromCard('Humita')
    cy.contains('🛒').click()
    cy.contains('Tu carrito').should('be.visible')
    cy.contains('Humita').should('be.visible')
  })

  it('removes a product from the cart drawer', () => {
    addProductFromCard('Humita')
    cy.contains('🛒').click()
    cy.contains('Tu carrito').should('be.visible')
    // click the minus button so quantity reaches zero
    cy.get('[data-testid="cart-drawer"]').within(() => {
      cy.contains('[data-testid="cart-item"]', 'Humita').within(() => {
        cy.get('[data-testid="quantity-decrease"]').click()
      })
    })
    // cart button disappears after removing last item
    cy.contains('Tu carrito').should('not.exist')
  })

  it('shows the checkout modal', () => {
    addProductFromCard('Choclo')
    cy.contains('🛒').click()
    cy.contains('Continuar →').click()
    cy.contains('Checkout').should('be.visible')
    cy.get('input[type="text"]').first().should('be.visible')
  })

  it('opens product modal with optional content', () => {
    cy.contains('[data-testid="product-card"]', 'Carne Picante').within(() => {
      cy.contains('+ Agregar').click()
    })
    cy.get('[data-testid="product-modal"]').within(() => {
      cy.contains('Carne Picante').should('be.visible')
      cy.contains('Relleno de carne vacuna').should('be.visible')
      cy.contains('button', 'Cancelar').click()
    })
    cy.get('[data-testid="product-modal"]').should('not.exist')
  })

  it('adds selected quantity from the product modal', () => {
    cy.contains('[data-testid="product-card"]', 'Carne Picante').within(() => {
      cy.get('button').last().click()
    })

    cy.get('[data-testid="product-modal"]').within(() => {
      cy.get('[data-testid="product-modal-quantity-value"]').should('have.text', '1')
      cy.get('[data-testid="product-modal-quantity-increase"]').click().click()
      cy.get('[data-testid="product-modal-quantity-value"]').should('have.text', '3')
      cy.get('[data-testid="product-modal-add"]').click()
    })

    cy.contains('🛒').click()
    cy.get('[data-testid="cart-drawer"]').within(() => {
      cy.contains('[data-testid="cart-item"]', 'Carne Picante').within(() => {
        cy.contains('span', '3').should('be.visible')
      })
    })
  })

  it('shows "Not accepting orders" banner when restaurant is closed', () => {
    // This test assumes the API can be stubbed; skip if the restaurant is open
    cy.intercept('GET', '/api/v1/public/menu/empanadas-demo', (req) => {
      req.continue((res) => {
        res.body.restaurant.accepting_orders = false
      })
    }).as('menuApi')

    cy.visit(`/${SLUG}`)
    cy.wait('@menuApi')
    cy.contains('no está aceptando pedidos').should('be.visible')
    cy.get('[data-testid="product-card"]').should('not.exist')
    cy.contains('🛒').should('not.exist')
  })
})
