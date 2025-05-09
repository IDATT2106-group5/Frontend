/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display validation errors for empty inputs', () => {
    cy.get('button[type=submit]').click()
    cy.get('input[name=email]').then($el => expect($el[0].validationMessage).to.exist)
    cy.get('input[name=password]').then($el => expect($el[0].validationMessage).to.exist)
  })

  it('should toggle password visibility when clicking the eye icon', () => {
    cy.get('input[name=password]').should('have.attr', 'type', 'password')
    cy.get('input[name=password]').parent().find('button').click()
    cy.get('input[name=password]').should('have.attr', 'type', 'text')
    cy.get('input[name=password]').parent().find('button').click()
    cy.get('input[name=password]').should('have.attr', 'type', 'password')
  })

  it('should login successfully and update navbars', () => {
    // Mock login response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { data: { token: 'fake-jwt-token', requires2FA: false } }
    }).as('loginRequest')

    // Mock initial user data fetch
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', role: 'USER' }
    }).as('getUser')

    // Fill form and submit
    cy.get('input[name=email]').type('test@example.com')
    cy.get('input[name=password]').type('Password123!')
    cy.get('button[type=submit]').click()

    // Wait for API calls
    cy.wait('@loginRequest')
    cy.wait('@getUser')

    // Persist token in localStorage so navbars reflect login
    cy.window().then(win => {
      win.localStorage.setItem('jwt', 'fake-jwt-token')
    })

    // Stub the autoLogin user fetch on revisiting home
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', role: 'USER' }
    }).as('getUserAgain')

    // Visit home to load navbar
    cy.visit('/')

    // Wait for the autoLogin fetch
    cy.wait('@getUserAgain')

    // Assert that navbar shows logout or user menu instead of login/register
  cy.get('nav').should('not.contain', 'Login')
    cy.get('nav').should('not.contain', 'Registrer')
  })

  it('should show error on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { error: 'Invalid credentials' } }).as('loginFail')
    cy.get('input[name=email]').type('wrong@example.com')
    cy.get('input[name=password]').type('wrongpass')
    cy.get('button[type=submit]').click()
    cy.wait('@loginFail')
    cy.get('.bg-red-100').should('contain.text', 'Innlogging feilet')
  })

  it('should go to two factor page when admin tries to log in', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest')

    // Mock the 2FA code generation endpoint
    cy.intercept('POST', '/api/admin/login/2fa/generate', {
      statusCode: 200,
      body: { success: true }
    }).as('generate2FA')
  
    // Fill form with admin credentials and submit
    cy.get('input[name=email]').type('admin@test.test')
    cy.get('input[name=password]').type('Password123!')
    cy.get('button[type=submit]').click()
  
    // Wait for API calls
    cy.wait('@loginRequest')
    cy.wait('@generate2FA').then((interception) => {
      // Verify the generate2FA request was made with correct email
      expect(interception.request.body).to.have.property('email', 'admin@test.test')
    })
  
    // Verify redirect to 2FA page with correct email
    cy.url().should('include', '/2FA')
    cy.url().should('include', 'email=admin@test.test')
  
    // Verify 2FA page elements
    cy.contains('To-faktor autentisering').should('be.visible')
    cy.contains('Skriv inn koden sendt til admin@test.test').should('be.visible')
    cy.get('input[type="text"]').should('have.length', 6)
    cy.contains('button', 'Bekreft').should('be.visible')
  })
})
