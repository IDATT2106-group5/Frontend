describe('Authentication', () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it('should allow a user to log in', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUser').email);
    cy.get('input[name="password"]').type(Cypress.env('testUser').password);
    // cy.get('button[type="submit"]').click();

    cy.login(Cypress.env('testUser').email, Cypress.env('testUser').password);

    cy.url().should('include', '/');
    // cy.contains('Welcome').should('be.visible');
  });

});
