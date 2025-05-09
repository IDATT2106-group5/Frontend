describe('NewsAdminView.vue', () => {
  const loginUrl = '/login'
  const dashboardUrl = '/admin-dashboard'
  const listUrl = '/admin-news'

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

  it('creates a new news item successfully', () => {
    loginAndSetJwt()

    cy.visit(dashboardUrl)
    cy.visit(listUrl)

    const newNewsItem = {
      id: 999,
      title: 'Viktig melding',
      source: 'Trondheim Kommune',
      content: 'Dette er en viktig melding fra kommunen',
      url: 'https://trondheim.kommune.no/viktig-melding',
      createdAt: new Date().toISOString(),
      isCrisis: false
    }



    cy.intercept('POST', '/api/news', {
      statusCode: 201,
      body: newNewsItem
    }).as('createNews')


    cy.get('[cy-data="create-news-button"]').click()

    cy.get('input#title').type(newNewsItem.title)
    cy.get('textarea#content').type(newNewsItem.content)
    cy.get('input#url').type(newNewsItem.url)
    cy.contains('button', 'Lagre').click()

    cy.wait('@createNews')
    // Success toast should appear
    cy.contains('Ny nyhet ble lagt til').should('be.visible')
  })

  it('edits an existing news item successfully', () => {
    const newsId = 42
    const newsItem = {
      id: newsId,
      title: 'Original nyhet',
      source: 'Trondheim Kommune',
      content: 'Dette er den originale nyhetsteksten',
      url: 'https://trondheim.kommune.no/original',
      createdAt: new Date().toISOString(),
      isCrisis: false
    }

    const updatedNewsItem = {
      ...newsItem,
      title: 'Oppdatert nyhet',
      content: 'Dette er den oppdaterte nyhetsteksten',
      url: 'https://trondheim.kommune.no/oppdatert'
    }

    cy.window().then(win => {
      win.localStorage.setItem('jwt', token)
    })

    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: mockUser
    }).as('getUser')

    cy.intercept('POST', '/api/household/details', {
      statusCode: 200,
      body: {}
    }).as('mockHousehold')

    cy.intercept('GET', '/api/news', {
      statusCode: 200,
      body: [newsItem]
    }).as('getNews')

    cy.intercept('PUT', `/api/news/${newsId}`, {
      statusCode: 200,
      body: updatedNewsItem
    }).as('updateNews')

    cy.visit(listUrl)
    cy.wait('@getNews')

    // Find and click on the edit button for the news item
    cy.contains(newsItem.title)
      .parent()
      .parent()
      .find('button')
      .contains('Rediger')
      .click()

    // Update the news item fields
    cy.get('input#title').clear().type(updatedNewsItem.title)
    cy.get('textarea#content').clear().type(updatedNewsItem.content)
    cy.get('input#url').clear().type(updatedNewsItem.url)
    cy.contains('button', 'Lagre').click()

    cy.wait('@updateNews')
    // Success toast should appear
    cy.contains('Nyhet ble oppdatert').should('be.visible')
  })

  it('deletes a news item successfully', () => {
    const newsId = 42
    const newsItem = {
      id: newsId,
      title: 'Nyhet som skal slettes',
      source: 'Trondheim Kommune',
      content: 'Dette er en nyhet som skal slettes',
      url: 'https://trondheim.kommune.no/slettes',
      createdAt: new Date().toISOString(),
      isCrisis: false
    }

    cy.window().then(win => {
      win.localStorage.setItem('jwt', token)
    })

    cy.intercept('GET', '/api/user/me', {
      statusCode: 200,
      body: mockUser
    }).as('getUser')

    cy.intercept('POST', '/api/household/details', {
      statusCode: 200,
      body: {}
    }).as('mockHousehold')

    cy.intercept('GET', '/api/news', {
      statusCode: 200,
      body: [newsItem]
    }).as('getNews')

    cy.intercept('DELETE', `/api/news/${newsId}`, {
      statusCode: 200
    }).as('deleteNews')

    cy.visit(listUrl)
    cy.wait('@getNews')

    // Find and click on the edit button for the news item
    cy.contains(newsItem.title)
      .parent()
      .parent()
      .find('button')
      .contains('Rediger')
      .click()

    // Click the delete button
    cy.contains('button', 'Slett').click()

    // Confirm deletion in the modal
    cy.contains('button', 'Bekreft').click()

    cy.wait('@deleteNews')
    // Success toast should appear
    cy.contains('Nyhet ble slettet').should('be.visible')
  })

  it('validates form fields properly', () => {
    loginAndSetJwt()

    cy.visit(dashboardUrl)
    cy.visit(listUrl)

    const newsId = 42
    const newsItem = {
      id: newsId,
      title: 'Nyhet som skal slettes',
      source: 'Trondheim Kommune',
      content: 'Dette er en nyhet som skal slettes',
      url: 'https://trondheim.kommune.no/slettes',
      createdAt: new Date().toISOString(),
      isCrisis: false
    }

    cy.intercept('GET', '/api/news', {
      statusCode: 200,
      body: [newsItem]
    }).as('getNews')

    cy.wait('@getNews')

    cy.get('[cy-data="create-news-button"]').click()

    // Try to save without filling required fields
    cy.contains('button', 'Lagre').click()

    // Validation errors should appear
    cy.contains('Tittel er påkrevd').should('be.visible')
    cy.contains('Innhold er påkrevd').should('be.visible')
    cy.contains('URL er påkrevd').should('be.visible')

    // Fill in the fields and validation errors should disappear
    cy.get('input#title').type('Test tittel')
    cy.get('textarea#content').type('Test innhold')
    cy.get('input#url').type('https://test.no')

    // Errors should not be visible now
    cy.contains('Tittel er påkrevd').should('not.exist')
    cy.contains('Innhold er påkrevd').should('not.exist')
    cy.contains('URL er påkrevd').should('not.exist')
  })
})