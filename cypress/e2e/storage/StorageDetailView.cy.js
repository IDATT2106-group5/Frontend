// cypress/e2e/storage-detail.spec.js

describe('Storage Detail View', () => {
  beforeEach(() => {
    // Mock necessary data and API responses
    cy.intercept('GET', '**/api/households/current', {
      statusCode: 200,
      body: { id: 'mock-household-id' }
    }).as('getHousehold');

    cy.intercept('GET', '**/api/storage/items*', {
      statusCode: 200,
      body: {
        'Væske': [
          {
            id: '1',
            name: 'Vann (Imsdal)',
            expiryDate: '01.12.2025',
            quantity: 5,
            unit: 'Liter'
          }
        ],
        'Mat': [
          {
            id: '1',
            name: 'Hamburger',
            expiryDate: '05.06.2025',
            quantity: 2,
            unit: 'kg'
          }
        ]
      }
    }).as('getStorageItems');

    cy.intercept('GET', '**/api/item-templates*', {
      statusCode: 200,
      body: [
        {
          id: 'template-1',
          name: 'New Water Bottle',
          itemType: 'LIQUIDS'
        },
        {
          id: 'template-2',
          name: 'Canned Beans',
          itemType: 'FOOD'
        }
      ]
    }).as('getItemTemplates');

    // Visit the storage detail page
    cy.visit('/storage-detail');
    cy.wait('@getHousehold');
    cy.wait('@getStorageItems');
  });

  it('should open edit mode and create a new item', () => {
    // Click the Edit button to enter edit mode
    cy.contains('button', 'Rediger - / Legg til i lager').click();

    // Verify we're in edit mode
    cy.contains('button', 'Lukk').should('be.visible');

    // Open the væske (liquids) accordion if not already open
    cy.contains('.flex', 'Væske').click();

    // Wait for the AddStorageItem component to be visible
    cy.wait(500); // Short wait to ensure accordion animation completes

    // Mock the POST request for adding a new item
    cy.intercept('POST', '**/api/storage/items*', {
      statusCode: 201,
      body: {
        id: 'new-item-id',
        name: 'New Water Bottle',
        expiryDate: '01.06.2025',
        quantity: 3,
        unit: 'Liter'
      }
    }).as('addItem');

    // Click on dropdown to select item
    cy.get('[placeholder="Velg vare"]').first().click();

    // Wait for item templates to load
    cy.wait('@getItemTemplates');

    // Select the first item from the dropdown
    cy.contains('New Water Bottle').click();

    // Set expiry date
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const formattedDate = futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    cy.get('input[type="date"]').first().type(formattedDate);

    // Set quantity
    cy.get('input[type="number"]').first().clear().type('3');

    // Click the add button
    cy.get('button').find('svg').first().click();

    // Wait for the add request to complete
    cy.wait('@addItem');

    // Verify success toast appears
    cy.contains('Vare lagt til').should('be.visible');

    // Close edit mode
    cy.contains('button', 'Lukk').click();
  });

  it('should open edit mode and edit an existing item', () => {
    // Click the Edit button to enter edit mode
    cy.contains('button', 'Rediger - / Legg til i lager').click();

    // Open the væske (liquids) accordion if not already open
    cy.contains('.flex', 'Væske').click();

    // Wait for the items to be visible
    cy.wait(500);

    // Mock the PUT request for updating an item
    cy.intercept('PUT', '**/api/storage/items/*', {
      statusCode: 200,
      body: {
        id: 'vaske-item-1',
        name: 'Water (1.5L)',
        expiryDate: '15.12.2025',
        quantity: 10,
        unit: 'Liter'
      }
    }).as('updateItem');

    // First, expand the item group to see individual items
    cy.contains('Water').click();

    // Find and click edit button (Pencil icon) for the first item
    cy.get('svg').filter((_idx, el) => {
      return Cypress.$(el).attr('class')?.includes('text-gray-600 hover:text-blue-600');
    }).first().click();

    // Modify quantity input
    cy.get('input[type="number"]').first().clear().type('10');

    // Modify date input (set it to 15th of December 2025)
    cy.get('input[type="date"]').first().clear().type('2025-12-15');

    // Click save button (represented by Save icon)
    cy.get('svg').filter((_idx, el) => {
      return Cypress.$(el).attr('class')?.includes('text-gray-600 hover:text-green-600');
    }).first().click();

    // Wait for the update request to complete
    cy.wait('@updateItem');

    // Verify success toast appears
    cy.contains('Oppdaterte vare').should('be.visible');

    // Close edit mode
    cy.contains('button', 'Lukk').click();
  });

  it('should open edit mode and delete an item', () => {
    // Click the Edit button to enter edit mode
    cy.contains('button', 'Rediger - / Legg til i lager').click();

    // Open the mat (food) accordion if not already open
    cy.contains('.flex', 'Mat').click();

    // Wait for the items to be visible
    cy.wait(500);

    // Mock the DELETE request for deleting an item
    cy.intercept('DELETE', '**/api/storage/items/*', {
      statusCode: 200
    }).as('deleteItem');

    // First, expand the item group to see individual items
    cy.contains('Rice').click();

    // Find and click delete button (Trash icon) for the first item
    cy.get('svg').filter((_idx, el) => {
      return Cypress.$(el).attr('class')?.includes('text-gray-600 hover:text-red-600');
    }).first().click();

    // Confirm deletion in the modal
    cy.contains('Slett').click();

    // Wait for the delete request to complete
    cy.wait('@deleteItem');

    // Verify success toast appears
    cy.contains('Slettet vare').should('be.visible');

    // Close edit mode
    cy.contains('button', 'Lukk').click();
  });
});