describe('Storage Detail - Real Backend Testing', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/users/profile').as('getUserProfile');
    cy.intercept('GET', '**/api/households/current').as('getCurrentHousehold');
    cy.intercept('GET', '**/api/storage/items*').as('fetchStorageItems');

    cy.visit('http://localhost:5173/login');

    cy.get('input[name="email"]').type('nathalie.graidy@gmail.com');
    cy.get('input[name="password"]').type('12345678');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('eq', 'http://localhost:5173/');

    cy.visit('http://localhost:5173/storage-detail');


    cy.contains('Rediger - / Legg til i lager').should('be.visible');
  });

  it('adds an item to storage', () => {

    cy.contains('.flex.items-center.gap-3', 'Væske').click()


    cy.contains('button', 'Rediger - / Legg til i lager').click()

    cy.contains('span', 'Velg vare').click()

    cy.get('input[placeholder="Søk etter vare..."]').type('Vann')

    cy.get('.absolute.z-10 div')
      .not(':contains("Ingen varer funnet")')
      .first()
      .click()

    cy.get('input[type="date"]').type('2025-12-31')

    cy.get('input[type="number"]').clear().type('3')

    cy.get('.flex.items-center.space-x-4 button').first().click();

    cy.contains('Vare lagt til').should('be.visible')
  })

  it('updates an item in storage', () => {
    cy.contains('.flex.items-center.gap-3', 'Væske').click()

    cy.contains('button', 'Rediger - / Legg til i lager').click()

    cy.wait(500)

    cy.get('.grid.grid-cols-5')
      .contains('Vann')
      .closest('.grid.grid-cols-5')
      .click()

    cy.wait(300)

    cy.get('[data-cy="edit-button"]').first().click()

    cy.wait(300)

    cy.get('input[type="number"]').clear()

    cy.get('input[type="number"]')
      .first().click().type('300', { force: true })

    cy.get('[data-cy="save-button"]').first().click()

    cy.contains('Oppdaterte vare').should('be.visible')

    cy.contains('300 Liter').should('exist')

    cy.contains('button', 'Lukk').click()
  })

  it('delete an item in storage', () => {
    cy.contains('.flex.items-center.gap-3', 'Væske').click()

    cy.contains('button', 'Rediger - / Legg til i lager').click()

    cy.wait(500)


    cy.get('.grid.grid-cols-5')
      .contains('Vann')
      .closest('.grid.grid-cols-5')
      .click()

    cy.wait(300)

    cy.get('[data-cy="delete-button"]').first().click()

    cy.get('[data-cy="modal-confirm-button"]').click();

    cy.contains('Slettet vare').should('be.visible')

    cy.contains('button', 'Lukk').click()

  });
});