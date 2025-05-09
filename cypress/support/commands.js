// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: {
      email: email,
      password: password
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    return response;
  });
});

// Reset database command
// Update your Cypress command
Cypress.Commands.add('resetDatabase', () => {
  // First check health endpoint
  cy.request({
    url: `${Cypress.env('apiUrl')}/api/test/health`,
    failOnStatusCode: false
  }).then(healthResponse => {
    cy.log(`Health endpoint response: ${healthResponse.status} - ${healthResponse.body}`);

    // Make request to reset database
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/test/reset-db`,
      failOnStatusCode: false,
      headers: {
        'Accept': '*/*'
      }
    }).then((response) => {
      cy.log(`Database reset response: ${response.status}`);
      if (response.status !== 200) {
        cy.log(`Error: ${JSON.stringify(response)}`);
      }
    });
  });
});
