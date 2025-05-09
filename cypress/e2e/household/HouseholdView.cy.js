describe('Household Main View (Owner) – text-based selectors', () => {
  const OWNER = {
    email: 'test@user.test',
    password: '12345678'
  };

  beforeEach(() => {
    cy.login(OWNER.email, OWNER.password);

    cy.visit('/household');

    cy.contains('span', /^ID:/, { timeout: 10000 })
      .should('be.visible');
  });

  it('displays the household ID', () => {
    cy.contains('span', /^ID:/)
      .should('contain.text', 'ID:')
      .invoke('text')
      .then(fullText => {
        expect(fullText.trim()).to.match(/^ID:\s*[A-Za-z0-9]+$/);
      });
  });

  it('copies the household ID to the clipboard', () => {
    cy.window().then(win => {
      if (!win.navigator.clipboard) {
        win.navigator.clipboard = {};
      }
      win.navigator.clipboard.writeText = cy.stub().as('writeText').resolves();
    });

    cy.contains('span', /^ID:/)
      .invoke('text')
      .then(fullText => {
        const id = fullText.replace(/^ID:\s*/, '');

        cy.contains('span', /^ID:/)
          .parent()         
          .find('button')  
          .click();

        cy.get('@writeText')
          .should('have.been.calledWith', id);
      });

    cy.contains('Husstands-ID kopiert')
      .should('be.visible');
  });

  it('opens the invite modal and sends a stubbed invitation', () => {

    cy.intercept('POST', 'api/household/send-invitation', {
      statusCode: 200,
      body: { message: 'Invitation sent (stub)' }
    }).as('sendInvitation')

    cy.contains('button', 'Medlemmer').click()

    cy.contains('button', 'Send invitasjon').click()

    cy.get('input[placeholder="E-postadresse"]')
      .should('be.visible')
      .type('test@user3.test')

    cy.get('[data-cy="invite-button"]')
      .should('be.visible')
      .and('not.be.disabled')
      .click()

    cy.contains('Allerede sendt invitasjon til denne e-posten')
  });

  it('adds/remove a unregistered from the household', () => {

    cy.contains('button', 'Legg til medlem').click()

    cy.get('input[placeholder="Navn på medlem"]')
    .should('be.visible')
    .type('Bobby')
  
    cy.get('[data-cy="add-member"]')
    .click()

    cy.contains('Bruker Bobby har blitt lagt til i husstanden')

    cy.contains('button', 'Avbryt').last().click()


    cy.get('[data-cy="search-member-input"]')
    .should('be.visible')
    .type('Bobby')

    cy.contains('Bobby')

    cy.contains('button', 'Fjern').click()

    cy.contains('Fjern medlem')

    cy.get('[data-cy="modal-confirm-button"]')
      .click()

    cy.contains('Bobby er fjernet fra husstanden')
    })

  it("search household members", () => {
    cy.get('[data-cy="search-member-input"]')
      .should('be.visible')
      .type('Bob Ross')

    cy.contains('Bob Ross')
  });

  it("edit a existing unregistered user", () => {

    cy.get('[data-cy="search-member-input"]')
      .should('be.visible')
      .type('Bob Ross')

    cy.contains('Bob Ross')
      .parents('div')     
      .find('[data-cy="edit-member-button"]')
      .click()

    cy.contains('button', 'Lagre').click()

    cy.contains('Bob Ross ble oppdatert.')
  });

  it('should be able to search for a household', () => {
      cy.contains('button', 'Medlemmer').click()
  });

  it("should be able to search for another household", () => {
      cy.contains('button', 'Søk husstand').click()

      cy.get('[data-cy="join-household-id-input"]')
        .should('be.visible')
        .type('5C100DC5')

      cy.get('[data-cy="search-household-button"]').click()

      cy.contains('Navn: Test')
      cy.contains('ID: 5C100DC5')
      
  });
});
