describe('IncidentAdmin.vue', () => {
  // Test constants
  const loginUrl = '/login'
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
    loginAndSetJwt()
    
    cy.intercept('GET', '/api/incidents', {
      statusCode: 200,
      body: [mockIncident]
    }).as('getIncidents')
    
    cy.intercept('GET', '/api/scenarios', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Flom', iconName: 'Droplets' },
        { id: 2, name: 'Brann', iconName: 'Flame' }
      ]
    }).as('getScenarios')
    
    cy.visit(incidentsUrl)
    
    cy.wait('@getIncidents')
    cy.wait('@getScenarios')
  })
  
  it('displays incidents list and map', () => {
    cy.contains('Aktive kriseområder').should('be.visible')
    cy.contains(mockIncident.name).should('be.visible')
    
    cy.get('#map').should('be.visible')
  })
  
  it('creates a new incident successfully with success alert', () => {
    cy.intercept('POST', '/api/incidents', {
      statusCode: 201,
      body: { ...mockIncident, id: 456 }
    }).as('createIncident')
    
    cy.contains('button', '+ Legg til ny krisesituasjon').click()
    
    cy.get('#name').type('New Test Incident')
    cy.get('textarea#description').type('Description for new test incident')
    
    cy.contains('.flex-1', 'Forhøyet farenivå').click()
    
    cy.get('input#radius').invoke('val', 3).trigger('input')
    
    cy.contains('button', 'Lagre').click()
    
    cy.wait('@createIncident')
    
    cy.contains('Krise ble opprettet').should('be.visible')
    
    cy.contains('Aktive kriseområder').should('be.visible')
  })
  
  it('edits an existing incident with success alert', () => {
    cy.intercept('PUT', `/api/incidents/${mockIncident.id}`, {
      statusCode: 200,
      body: updatedIncident
    }).as('updateIncident')
    
    cy.contains("button", "Rediger").click()
    
    cy.get('#name').clear()
    cy.get('#name').type(updatedIncident.name)
    cy.get('textarea#description').clear()
    cy.get('textarea#description').type(updatedIncident.description)

    cy.contains('div.flex-1', 'Forhøyet farenivå').click()
    
    cy.get('input#radius').invoke('val', 7).trigger('input')
    
    cy.contains('button', 'Lagre').click()
    
    cy.wait('@updateIncident')
    
    cy.contains('Krise ble oppdatert').should('be.visible')
  })
  
  it('deletes an incident with confirmation and success alert', () => {
    cy.intercept('DELETE', `/api/incidents/${mockIncident.id}`, {
      statusCode: 200,
      body: { success: true }
    }).as('deleteIncident')
    
    cy.contains('button', 'Rediger').click()
    
    cy.contains('button', 'Slett krise').click()
    
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('be.visible')
    
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Slett').click()
    })
    
    cy.wait('@deleteIncident')
    
    cy.contains('Slettet en krise').should('be.visible')
    
    cy.contains('Aktive kriseområder').should('be.visible')
    cy.contains(mockIncident.name).should('not.exist')
  })
  
  it('cancels incident deletion when Cancel is clicked', () => {
    cy.contains('button', 'Rediger').click()
    
    cy.contains('button', 'Slett krise').click()
    
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('be.visible')
    
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Avbryt').click()
    })
    
    cy.contains('Er du sikker på at du vil slette denne markøren?').should('not.exist')
    
    cy.contains('button', 'Avbryt').should('be.visible')
  })
  
  it('filters incidents by severity', () => {
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 200,
      body: [mockIncident]
    }).as('filterIncidents')
    
    cy.contains('button', 'Filtrer krisetyper').click()
    
    cy.contains('label', 'Kritisk farenivå').click()
    
    cy.wait('@filterIncidents')
    
    cy.contains(mockIncident.name).should('be.visible')
    
    cy.contains('button', 'Filtrer krisetyper').click()
    
    cy.contains('label', 'Forhøyet farenivå').click()
    
    cy.contains('Ingen krisesituasjoner funnet').should('be.visible')
  })
  
  it('searches for incidents and shows error alerts when needed', () => {
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('searchError')
    
    cy.get('input[placeholder="Søk hendelser..."]').first().type('error test{enter}')
    
    cy.wait('@searchError')
    
    cy.contains('Ingen krisesituasjoner funnet').should('be.visible')
    
    cy.intercept('GET', '/api/incidents*', {
      statusCode: 200,
      body: [mockIncident]
    }).as('searchSuccess')
    
    cy.get('input[placeholder="Søk hendelser..."]').first().clear()

    cy.get('input[placeholder="Søk hendelser..."]').first().type('test{enter}')
    
    cy.contains(mockIncident.name).should('be.visible')
  })
  
  it('handles map interactions and coordinate setting', () => {
    cy.contains('button', '+ Legg til ny krisesituasjon').click()
    
    cy.get('#map').click(300, 300)
    
    cy.get('.space-y-2 .flex.gap-4.mb-4 input').should('have.length.at.least', 2)
    
    cy.get('.space-y-2 .flex.gap-4.mb-4 input').first().should('not.have.value', '')
  })
})