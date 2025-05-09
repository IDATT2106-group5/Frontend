/// <reference types="cypress" />

context('Opprett ny husstand view', () => {
  beforeEach(() => {
    // --- MOCK AUTHENTICATION ---
    // 1) stub out the user/me call so userStore.user gets populated
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: { id: 42, fullName: 'Test User', role: 'USER' }
    }).as('fetchUser');

    // 2) seed a fake JWT so router.beforeEach sees us as logged in
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('jwt', 'fake-jwt-token');
      }
    });
    cy.wait('@fetchUser');

    // --- MOCK HOUSEHOLD SERVICE ---
    // 3) initial "no household" so create form shows
    cy.intercept('GET', '/api/household/details-by-user', {
      statusCode: 404,
      body: { error: 'Ingen husstand funnet' }
    }).as('getCurrentHousehold');

    // 4) mock createHousehold endpoint; tests can override via aliasResponse
    cy.intercept('POST', '/api/household', (req) => {
      req.reply(req.aliasResponse || {
        statusCode: 201,
        body: { id: 123, name: req.body.name, address: req.body.address, ownerId: 42 }
      });
    }).as('createHousehold');
  });


  it('shows loading state then the form', () => {
    cy.visit('/household/create');
    cy.contains('Laster inn...');
    cy.wait('@getCurrentHousehold');
    cy.contains('Opprett ny husstand');
  });

  it('validates empty name', () => {
    cy.visit('/household/create');
    cy.wait('@getCurrentHousehold');

    cy.get('button').contains('Opprett husstand').click();
    cy.get('.text-red-600').should('contain', 'Husstandsnavn kan ikke være tomt.');
  });

  it('validates name length > 20', () => {
    cy.visit('/household/create');
    cy.wait('@getCurrentHousehold');

    cy.get('input[placeholder*="Familien Hansen"]').type('A'.repeat(21));
    cy.get('button').contains('Opprett husstand').click();
    cy.get('.text-red-600')
      .should('contain', 'Navn kan ikke være lenger enn 20 tegn.');
  });

  it('validates address length > 50', () => {
    cy.visit('/household/create');
    cy.wait('@getCurrentHousehold');

    cy.get('input[placeholder*="Storgata"]').type('B'.repeat(51));
    cy.get('button').contains('Opprett husstand').click();
    cy.get('.text-red-600')
      .should('contain', 'Adresse kan ikke være lenger enn 50 tegn.');
  });

  it('submits valid form and redirects on success', () => {
    cy.visit('/household/create');
    cy.wait('@getCurrentHousehold');

    cy.get('input[placeholder*="Familien Hansen"]').type('Familien Hansen');
    cy.get('input[placeholder*="Storgata"]').type('Storgata 1, 0000 Oslo');

    cy.get('button').contains('Opprett husstand').click();

    cy.wait('@createHousehold').its('request.body').should(body => {
      expect(body).to.deep.include({
        name: 'Familien Hansen',
        address: 'Storgata 1, 0000 Oslo',
        ownerId: 42
      });
    });

    cy.url().should('include', '/household');
  });

  it('shows server error when create fails', () => {
    // override createHousehold to return 500
    cy.intercept('POST', '/api/household', {
      statusCode: 500,
      body: { error: 'Serverfeil' }
    }).as('createHouseholdError');

    cy.visit('/household/create');
    cy.wait('@getCurrentHousehold');

    cy.get('input[placeholder*="Familien Hansen"]').type('Familien Hansen');
    cy.get('button').contains('Opprett husstand').click();

    cy.wait('@createHouseholdError');
    cy.get('.text-red-600').should('contain', 'Serverfeil');
  });
});
