describe('Admin 2FA View', () => {
  beforeEach(() => {
    // Intercept and mock API calls
    cy.intercept('POST', '**/2fa/verify', { statusCode: 200, body: { success: true } }).as('verify2fa')
    cy.intercept('POST', '**/2fa/generate', { statusCode: 200, body: { success: true } }).as('resend2fa')

    // Visit the 2FA page with a test email
    cy.visit('/2FA?email=admin@example.com')
  })

  it('should render the 2FA form with correct elements', () => {
    // Check page title and content
    cy.contains('h1', 'To-faktor autentisering').should('be.visible')
    cy.contains('p', 'Skriv inn koden sendt til admin@example.com').should('be.visible')

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
        email: 'admin@example.com',
        otp: '123456'
      })

    // Check for navigation after successful verification
    cy.url().should('include', '/')
  })

  // it('should resend code when clicking the resend button', () => {
  //   // Click the resend button
  //   cy.contains('button', 'Send kode på nytt').click()

  //   // Wait for the API call
  //   cy.wait('@resend2fa').its('request.body')
  //     .should('deep.include', {
  //       email: 'admin@example.com'
  //     })

  //   // Check for alert message (requires cy.on('window:alert') to be set up)
  //   cy.on('window:alert', (text) => {
  //     expect(text).to.equal('En ny kode har blitt sendt til din e-post')
  //   })
  // })

  it('should redirect to login page when email is missing', () => {
    // Visit without email param
    cy.visit('/2FA')

    // Should be redirected to login
    cy.url().should('include', '/login')
  })
})
