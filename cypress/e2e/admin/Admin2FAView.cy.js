describe('Admin 2FA View', () => {
  const adminUser = {
    email: "admin@test.test",
    password: "Password123!"
  }

  beforeEach(() => {
    cy.adminLogin(adminUser.email, adminUser.password)
    // Intercept and mock API calls
    cy.intercept('POST', '**/2fa/verify', { statusCode: 200, body: { success: true } }).as('verify2fa')
    cy.intercept('POST', '**/2fa/generate', { statusCode: 200, body: { success: true } }).as('resend2fa')

  })

  it('should render the 2FA form with correct elements', () => {
    // Check page title and content
    cy.contains('h1', 'To-faktor autentisering').should('be.visible')
    cy.contains('p', 'Skriv inn koden sendt til ', adminUser.email).should('be.visible')

    // Verify all 6 input fields exist
    cy.get('input[type="text"]').should('have.length', 6)

    // Check for Bekreft button
    cy.contains('button[type="submit"]', 'Bekreft').should('be.visible')

    // Check for resend code option
    cy.contains('p', 'Har du ikke mottatt koden?').should('be.visible')
    cy.contains('button', 'Send kode på nytt').should('be.visible')
  })

  it('should automatically focus next input when entering a digit', () => {
    // Type in first field and verify focus moves to second
    cy.get('input[type="text"]').first().type('1')
    cy.get('input[type="text"]').first().should('have.value', '1')
    cy.get('input[type="text"]').eq(1).should('be.focused')

    // Continue typing to verify auto-focus behavior
    cy.get('input[type="text"]').eq(1).type('2')
    cy.get('input[type="text"]').eq(1).should('have.value', '2')
    cy.get('input[type="text"]').eq(2).should('be.focused')
  })

  it('should submit the form with the entered code', () => {
    // Fill all 6 input fields
    cy.get('input[type="text"]').each(($el, index) => {
      cy.wrap($el).type(index + 1)
    })

    // Submit the form
    cy.contains('button[type="submit"]', 'Bekreft').click()

    // Wait for the API call and verify it was made with correct data
    cy.wait('@verify2fa').its('request.body')
      .should('deep.include', {
        email: 'admin@test.test',
        otp: '123456'
      })

    // Check for navigation after successful verification
    cy.url().should('include', '/')
  })

  it('should redirect to login page when email is missing', () => {
    // Visit without email param
    cy.visit('/2FA')

    // Should be redirected to login
    cy.url().should('include', '/login')
  })

  it('should submit the code and verify 2FA', () => {
    // Test entering the code
    cy.get('input[type="text"]').each(($input, index) => {
      cy.wrap($input).type(index + 1) // Type 1,2,3,4,5,6
    })

    // Mock 2FA verification endpoint
    cy.intercept('POST', '/api/admin/login/2fa/verify', {
      statusCode: 200,
      body: {
        token: 'fake-admin-jwt',
        success: true
      }
    }).as('verify2FA')

    // Submit the code
    cy.contains('button', 'Bekreft').click()

    // Wait for verification request
    cy.wait('@verify2FA')
    
    // Verify redirect to admin dashboard after successful verification
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
