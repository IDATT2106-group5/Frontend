describe('Krisesituasjon Home View', () => {
    const email = 'test@user.test'
    const password = '12345678'
  
    beforeEach(() => {
      cy.session([email, password], () => {
        cy.visit('/login')
        cy.get('input[name=email]').type(email)
        cy.get('input[name=password]').type(password)
        cy.get('form').submit()
        cy.url().should('not.include', '/login')
      })
  
      cy.visit('/')
    })
  
    it('loads the page with content and links', () => {
      cy.contains('KRISESITUASJON')
      cy.get('header').should('contain', 'Siste krise oppdatering:')
  
      cy.contains('button', 'Alle nyheter')
      cy.get('[data-cy="map-link"]')

      cy.contains('Før')
      cy.contains('Under')
      cy.contains('Etter')
    })
  
    it('navigates to map and news when buttons are clicked', () => {
      cy.get('[data-cy="map-link"]').click()
      cy.url().should('include', '/map')
  
      cy.visit('/')
      cy.contains('button', 'Alle nyheter').click()
      cy.url().should('include', '/news')
    })
  
    it('navigates to preparedness pages', () => {
      cy.contains('Før').click()
      cy.url().should('include', '/before')
  
      cy.contains('Under').click()
      cy.url().should('include', '/under')
  
      cy.contains('Etter').click()
      cy.url().should('include', '/after')
    })

    it('navigates from Før to all 3 subpages', () => {
        cy.contains('Før').click()
        cy.url().should('include', '/before')
    
        cy.contains('Les mer om å forberede seg til en krise').click()
        cy.url().should('include', '/prepare-crisis')

        cy.contains('Oversikt').click()
        cy.url().should('include', '/before') 
    
        cy.contains('Få kunnskap om ulike').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.contains('Oversikt').click()
        cy.url().should('include', '/before') 
    
        cy.contains('Ta en quiz og test kunnskapene dine').click()
        cy.url().should('include', '/quiz')

        cy.contains('Oversikt').click()
        cy.url().should('include', '/before') 
      })

      it('navigates through each scenario and returns to the list', () => {
        cy.visit('/scenarios')

        cy.get('h2').contains('Syklon').click()
        cy.url().should('include', '/scenarios/1')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Brann').click()
        cy.url().should('include', '/scenarios/2')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Strømbrudd').click()
        cy.url().should('include', '/scenarios/3')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Innvasjon').click()
        cy.url().should('include', '/scenarios/5')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Flom').click()
        cy.url().should('include', '/scenarios/6')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Snøskred').click()
        cy.url().should('include', '/scenarios/7')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Atom bombe').click()
        cy.url().should('include', '/scenarios/8')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)

        cy.get('h2').contains('Pandemi').click()
        cy.url().should('include', '/scenarios/9')
        cy.wait(1000)
        cy.contains('button', 'Alle scenarioer').click()
        cy.url().should('include', '/scenarios')
        cy.wait(1000)
        
        })

        it('completes the quiz from start to finish', () => {
            cy.visit('/quiz')
        
            for (let i = 0; i < 10; i++) {
              cy.get('input[type="radio"]').first().check({ force: true })
              cy.contains('button', 'Sjekk svar').click()
              if (i < 9) {
                cy.contains('button', 'Neste spørsmål').click()
              } else {
                cy.contains('button', 'Se resultat').click()
              }
            }
        
            cy.contains('Du er ferdig!')
            cy.contains('Ta quizen på nytt')
          })

          it('navigates from Under to all 3 subpages', () => {
            cy.contains('Under').click()
            cy.url().should('include', '/under')
        
            cy.contains('Finn trygg plass, hold deg innendørs').click()
            cy.url().should('include', '/seek-safety')
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/under') 
        
            cy.contains('Kommunikasjon og håndtering av akutte behov').click()
            cy.url().should('include', '/emergency-tips')
            cy.wait(1000)
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/under') 
        
            cy.contains('Hold deg oppdatert på situasjonen').click()
            cy.url().should('include', '/alert')
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/under') 
          })

          it('navigates from After to all 3 subpages', () => {
            cy.contains('Etter').click()
            cy.url().should('include', '/after')
        
            cy.contains('Del erfaringer med andre, snakk om det som har skjedd').click()
            cy.url().should('include', '/talk')
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/after') 
        
            cy.contains('Råd for å håndtere stress og etterreaksjoner').click()
            cy.url().should('include', '/mental')
            cy.wait(1000)
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/after') 
        
            cy.contains('Evaluer beredskapen og gjør nødvendige endringer').click()
            cy.url().should('include', '/improve')
    
            cy.contains('Oversikt').click()
            cy.url().should('include', '/after') 
          })
      })