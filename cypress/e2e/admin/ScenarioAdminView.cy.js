describe('ScenarioAdminView.vue', () => {
    const loginUrl = '/login'
    const dashboardUrl = '/admin-dashboard'
    const listUrl = '/admin-scenarios'
    const createUrl = '/admin-scenarios/new'
  
    const mockUser = {
      id: 1,
      email: 'admin@hotmail.com',
      role: 'ADMIN'
    }
  
    const token = 'mock-jwt-token'
  
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
      cy.get('input[name=email]').type('admin@hotmail.com')
      cy.get('input[name=password]').type('password123')
      cy.get('form').submit()
  
      cy.wait('@login')
      cy.wait('@getUser')
  
      cy.window().then(win => {
        win.localStorage.setItem('jwt', token)
      })
    }
  
    it('creates a new scenario successfully', () => {
      loginAndSetJwt()
  
      cy.visit(dashboardUrl)
      cy.visit(listUrl)
      cy.visit(createUrl)
  
      cy.intercept('POST', '/api/scenarios', {
        statusCode: 201,
        body: {
          id: 999,
          name: 'Brann',
          description: 'Skogbrann',
          toDo: 'Checklist for test',
          packingList: 'Les nyheter',
          iconName: 'Flame'
        }
      }).as('createScenario')
  
      cy.get('input#name').type('Brann')
      cy.get('textarea').eq(0).type('Skogbrann')
      cy.get('textarea').eq(1).type('Les nyheter')
      cy.get('textarea').eq(2).type('Klær og utstyr')
      cy.contains('div', 'Flame').click()
      cy.contains('button', 'Lagre').click()
  
      cy.wait('@createScenario')
      cy.url().should('include', '/admin-scenarios')
    })
  
    it('edits an existing scenario successfully', () => {
        const scenarioId = 42
        const scenario = {
          id: scenarioId,
          name: 'Flom',
          description: 'Regn og flom',
          toDo: 'Flytt til høy grunn',
          packingList: 'Vann, klær',
          iconName: 'Droplets'
        }
      
        const updatedScenario = {
          ...scenario,
          name: 'Ekstrem flom',
          description: 'Ekstrem regn og flom',
          toDo: 'Flytt til høyere grunn',
          packingList: 'Vann, klær, mat',
          iconName: 'Droplets'
        }
      
        cy.window().then(win => {
          win.localStorage.setItem('jwt', token)
        })
      
        cy.intercept('GET', '/api/user/me', { statusCode: 200, body: mockUser }).as('getUser')
        cy.intercept('POST', '/api/household/details', {
          statusCode: 200,
          body: {}
        }).as('mockHousehold')
      
        cy.intercept('GET', '/api/scenarios', { statusCode: 200, body: [scenario] }).as('getScenarios')
      
        cy.intercept('PUT', `/api/scenarios/${scenarioId}`, {
          statusCode: 200,
          body: updatedScenario
        }).as('updateScenario')
      
        cy.visit(`/admin-scenarios/${scenarioId}`)
        cy.wait('@getScenarios')
      
        cy.get('input#name').clear().type(updatedScenario.name)
        cy.get('textarea').eq(0).clear().type(updatedScenario.description)
        cy.get('textarea').eq(1).clear().type(updatedScenario.toDo)
        cy.get('textarea').eq(2).clear().type(updatedScenario.packingList)
        cy.contains('div', updatedScenario.iconName).click()
      
        cy.contains('button', 'Lagre').click()
      
        cy.wait('@updateScenario')
        cy.url().should('include', '/admin-scenarios')
      })
  })