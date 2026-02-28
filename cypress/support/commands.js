// cy.login(email, password) — fills the Devise sign-in form
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/users/sign_in')
    cy.get('input[name="user[email]"]').type(email)
    cy.get('input[name="user[password]"]').type(password)
    cy.get('input[type="submit"]').click()
    cy.url().should('not.include', 'sign_in')
  })
})

// cy.clearCart(slug) — wipes localStorage cart for a restaurant slug
Cypress.Commands.add('clearCart', (slug) => {
  cy.window().then((win) => {
    win.localStorage.removeItem(`empanada_cart_${slug}`)
  })
})

// cy.waitForReact() — waits until the React root component has mounted
Cypress.Commands.add('waitForReact', () => {
  cy.get('[data-react-component]', { timeout: 10000 }).should('not.be.empty')
})
