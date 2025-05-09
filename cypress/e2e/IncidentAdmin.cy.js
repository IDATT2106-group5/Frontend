describe('IncidentAdmin.vue', () => {
  // Test constants
  const loginUrl = '/login'
  const dashboardUrl = '/admin-dashboard'
  const incidentsUrl = '/admin/incidents'
  
  // Mock admin user
  const mockUser = {
    id: 1,
    email: 'admin@test.com',
    role: 'ADMIN'
  }
  
  const token = 'mock-jwt-token'
  
  // Sample incident data for testing
  const mockIncident = {
    id: 123,
    name: 'Test Incident',
    description: 'This is a test incident',
    severity: 'RED',
    latitude: 63.4305,
    longitude: 10.3951,
    impactRadius: 5,
    startedAt: new Date().toISOString(),
    endedAt: null,
    scenarioId: null
  }

  const updatedIncident = {
    ...mockIncident,
    name: 'Updated Incident',
    description: 'This is an updated incident',
    severity: 'YELLOW',
    impactRadius: 7
  }
  
  // Log in as admin and set JWT token
  const loginAndSetJwt = () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token }
    }).as('login')
    
    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: mockUser
    }).as('getUser')
    
    cy.intercept('POST', '/api/household/details', {
      statusCode: 200,
      body: {}
    }).as('mockHousehold')
    
    cy.visit(loginUrl)
    cy.get('input[name=email]').type(mockUser.email)
    cy.get('input[name=password]').type('Password123!')
    cy.get('form').submit()
    
    cy.wait('@login')
    cy.wait('@getUser')
    
    cy.window().then(win => {
      win.localStorage.setItem('jwt', token)
    })
  }

  beforeEach(() => {
    // Login before each test
    loginAndSetJwt()
    
    // Mock API calls for incidents
    cy.intercept('GET', '/api/incidents', {
      statusCode: 200,
      body: [mockIncident]
    }).as('getIncidents')
    
    // Mock scenarios API calls
    cy.intercept('GET', '/api/scenarios', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Flom', iconName: 'Droplets' },
        { id: 2, name: 'Brann', iconName: 'Flame' }
      ]
    }).as('getScenarios')
    
    // Visit the incidents admin page
    cy.visit(incidentsUrl)
    
    // Wait for incidents to load
    cy.wait('@getIncidents')
    cy.wait('@getScenarios')
  })
  
  it('displays incidents list and map', () => {
    // Check that the incident list is visible
    cy.contains('Aktive kriseområder').should('be.visible')
    cy.contains(mockIncident.name).should('be.visible')
    
    // Check that the map is visible
    cy.get('#map').should('be.visible')
  })
  
  it('creates a new incident successfully with success alert', () => {
    // Mock the API call for creating a new incident
    cy.intercept('POST', '/api/incidents', {
      statusCode: 201,
      body: { ...mockIncident, id: 456 }
    }).as('createIncident')
    
    // FIXED: Button text is "Legg til ny krisesituasjon" not "Ny krise"
    cy.contains('button', 'Legg til ny krisesituasjon').click()
    
    // FIXED: Use the exact ID for the name input
    cy.get('#name').type('New Test Incident')
    cy.get('textarea#description').type('Description for new test incident')
    
    // FIXED: Severity is selected differently, using divs not a dropdown
    cy.contains('.flex-1', 'RED').click()
    
    // Set radius - keep as is
    cy.get('input[id*="impactRadius"]').clear()
    cy.get('input[id*="impactRadius"]').type('3')
    
    // Click save button
    cy.contains('button', 'Lagre').click()
    
    // Wait for the create API call
    cy.wait('@createIncident')
    
    // Verify success alert appears
    cy.get('.bg-green-100').should('be.visible')
    cy.contains('Krise ble opprettet').should('be.visible')
    
    // Verify we return to the incidents list
    cy.contains('Aktive kriseområder').should('be.visible')
  })
  
  it('edits an existing incident with success alert', () => {
    // Mock the API call for updating an incident
    cy.intercept('PUT', `/api/incidents/${mockIncident.id}`, {
      statusCode: 200,
      body: updatedIncident
    }).as('updateIncident')
    
    // Click on the existing incident to edit
    cy.contains("button", "Rediger").click()
    
    cy.get('#name').clear()
    cy.get('#name').type(updatedIncident.name)
    cy.get('textarea#description').clear()
    cy.get('textarea#description').type(updatedIncident.description)

    cy.contains('div.flex-1', 'Forhøyet farenivå').click()
    
    // Update radius
    cy.get('input#radius').invoke('val', 7).trigger('input')
    
    // Click save button
    cy.contains('button', 'Lagre').click()
    
    // Wait for the update API call
    cy.wait('@updateIncident')
    
    // Verify success alert appears
    cy.contains('Krise ble oppdatert').should('be.visible')
  })
  
  it('deletes an incident with confirmation and success alert', () => {
    // Mock the API call for deleting an incident
    cy.intercept('DELETE', `/api/incidents/${mockIncident.id}`, {
      statusCode: 200,
      body: { success: true }
    }).as('deleteIncident')
    
    // Click on the existing incident to edit
    cy.contains(mockIncident.name).click()
    
    // FIXED: Button text is "Slett krise" not "Slett"
    cy.contains('button', 'Slett krise').click()
    
    // Confirm modal should appear
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('be.visible')
    
    // Click the confirm button
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Slett').click()
    })
    
    // Wait for the delete API call
    cy.wait('@deleteIncident')
    
    // Verify success alert appears
    cy.get('.bg-green-100').should('be.visible')
    cy.contains('Krise ble slettet').should('be.visible')
    
    // Verify we return to the incidents list and the incident is no longer there
    cy.contains('Aktive kriseområder').should('be.visible')
    cy.contains(mockIncident.name).should('not.exist')
  })
  
  it('cancels incident deletion when Cancel is clicked', () => {
    // Click on the existing incident
    cy.contains(mockIncident.name).click()
    
    // FIXED: Button text is "Slett krise" not "Slett"
    cy.contains('button', 'Slett krise').click()
    
    // Confirm modal should appear
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('be.visible')
    
    // Click the cancel button
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Avbryt').click()
    })
    
    // Modal should disappear
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('not.exist')
    
    // We should still be in edit mode
    cy.contains('button', 'Avbryt').should('be.visible')
  })
  
  it('filters incidents by severity', () => {
    // Mock filtered results
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 200,
      body: [mockIncident]
    }).as('filterIncidents')
    
    // FIXED: Button text is "Filtrer krisetyper" not "Filter"
    cy.contains('button', 'Filtrer krisetyper').click()
    
    // Select RED severity filter
    cy.get('input[value="RED"]').click()
    
    // Wait for filtered results
    cy.wait('@filterIncidents')
    
    // Should show filtered results
    cy.contains(mockIncident.name).should('be.visible')
    
    // Change filter
    cy.contains('button', 'Filtrer krisetyper').click()
    cy.get('input[value="YELLOW"]').click()
    
    // Mock empty results for YELLOW filter
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 200,
      body: []
    }).as('emptyFilterResults')
    
    cy.wait('@emptyFilterResults')
    
    // Should show no results for YELLOW filter
    cy.contains('Ingen krisesituasjoner funnet').should('be.visible')
  })
  
  it('searches for incidents and shows error alerts when needed', () => {
    // Mock search results with server error first to test error alert
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('searchError')
    
    // FIXED: Use more specific selector for the search input
    cy.get('input[placeholder="Søk hendelser..."]').type('error test{enter}')
    
    cy.wait('@searchError')
    
    // Error alert should appear
    cy.get('.bg-red-100').should('be.visible')
    cy.contains('Klarte ikke laste krisesituasjoner').should('be.visible')
    
    // Clear the error by clicking X
    cy.get('.bg-red-100 button').click()
    
    // Error should disappear
    cy.get('.bg-red-100').should('not.exist')
    
    // Now mock successful search
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 200,
      body: [mockIncident]
    }).as('searchSuccess')
    
    // Type in search box again with more specific selector
    cy.get('input[placeholder="Søk hendelser..."]').clear().type('test{enter}')
    
    cy.wait('@searchSuccess')
    
    // Should show search results
    cy.contains(mockIncident.name).should('be.visible')
  })
  
  it('handles map interactions and coordinate setting', () => {
    // FIXED: Button text is "Legg til ny krisesituasjon" not "Ny krise"
    cy.contains('button', 'Legg til ny krisesituasjon').click()
    
    // Click on the map to set coordinates
    cy.get('#map').click(300, 300)
    
    // Coordinates should be updated in the form
    cy.get('input[v-model="incidentFormData.latitude"]').should('not.have.value', '')
    cy.get('input[v-model="incidentFormData.longitude"]').should('not.have.value', '')
  })
})