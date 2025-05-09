// cypress/e2e/household-view.cy.js

import { useHouseholdStore } from '@/stores/HouseholdStore'
import { useUserStore } from '@/stores/UserStore'

describe('HouseholdView Component', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.window().then((win) => {
      win.sessionStorage.clear()
      win.localStorage.clear()
    })
    
    // Mock Pinia stores
    cy.stub(useUserStore(), 'user').returns({ 
      id: 'user1', 
      email: 'test@example.com',
      fullName: 'Test User' 
    })
  })

  describe('No Household State', () => {
    beforeEach(() => {
      // Mock the household store to return no household
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(false)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(null)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(false)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(false)
      
      // Visit the household view route
      cy.visit('/household')
    })

    it('should display NoHouseholdView when user has no household', () => {
      cy.get('div').contains('NoHouseholdView').should('be.visible')
      cy.get('button').contains('Opprett husstand').should('be.visible')
    })

    it('should display received invitations if available', () => {
      const mockInvitations = [
        { 
          id: 'inv1', 
          householdId: 'h1', 
          householdName: 'Test Household', 
          status: 'PENDING' 
        }
      ]
      
      cy.stub(useHouseholdStore(), 'receivedInvitations').returns(mockInvitations)
      cy.get('div').contains('Invitasjoner').should('be.visible')
      cy.get('div').contains('Test Household').should('be.visible')
      cy.get('button').contains('Aksepter').should('be.visible')
      cy.get('button').contains('Avslå').should('be.visible')
    })
  })

  describe('With Household State', () => {
    beforeEach(() => {
      // Mock a household with owner permission
      const mockHousehold = {
        id: 'h1', 
        name: 'My Test Home', 
        address: 'Testvegen 123, Oslo', 
        ownerId: 'user1'
      }
      
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(true)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(mockHousehold)
      cy.stub(useHouseholdStore(), 'householdName').returns(mockHousehold.name)
      cy.stub(useHouseholdStore(), 'householdAddress').returns(mockHousehold.address)
      cy.stub(useHouseholdStore(), 'householdId').returns(mockHousehold.id)
      cy.stub(useHouseholdStore(), 'isOwner').returns(true)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(true)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(true)
      cy.stub(useHouseholdStore(), 'copyHouseholdId').returns(undefined)
      
      // Visit the household view route
      cy.visit('/household')
    })

    it('should display household information', () => {
      cy.get('h1').contains('My Test Home').should('be.visible')
      cy.get('p').contains('Testvegen 123, Oslo').should('be.visible')
      cy.get('span').contains('ID: h1').should('be.visible')
    })

    it('should display owner actions when user is the owner', () => {
      cy.get('button').contains('Slett').should('be.visible')
      cy.get('button').contains('Forlat').should('be.visible')
      cy.get('button').contains('Edit').should('be.visible') // Icon button for edit
    })

    it('should copy household ID when copy button is clicked', () => {
      const clipboardSpy = cy.spy(navigator.clipboard, 'writeText')
      cy.get('button').contains('Copy').click()
      cy.wrap(clipboardSpy).should('be.calledWith', 'h1')
      cy.contains('Husstands-ID kopiert').should('be.visible')
    })

    it('should open edit household modal when edit button is clicked', () => {
      cy.stub(useHouseholdStore(), 'openEditHouseholdForm').as('openEditForm')
      cy.get('button').contains('Edit').click()
      cy.get('@openEditForm').should('have.been.called')
    })

    it('should show confirmation modal when delete button is clicked', () => {
      cy.get('button').contains('Slett').click()
      cy.contains('Slett husstand').should('be.visible')
      cy.contains('Er du sikker? Dette kan ikke angres.').should('be.visible')
    })

    it('should show warning modal when owner tries to leave household', () => {
      cy.get('button').contains('Forlat').click()
      cy.contains('Kan ikke forlate').should('be.visible')
      cy.contains('Overfør eierskap eller slett husstanden først.').should('be.visible')
    })
  })

  describe('Members Tab', () => {
    beforeEach(() => {
      // Mock a household with members
      const mockHousehold = {
        id: 'h1', 
        name: 'My Test Home', 
        address: 'Testvegen 123, Oslo', 
        ownerId: 'user1'
      }
      
      const mockMembers = {
        registered: [
          { id: 'user1', fullName: 'Test User', email: 'test@example.com', isRegistered: true },
          { id: 'user2', fullName: 'Jane Doe', email: 'jane@example.com', isRegistered: true }
        ],
        unregistered: [
          { id: 'm1', fullName: 'Guest User', isRegistered: false }
        ]
      }
      
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(true)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(mockHousehold)
      cy.stub(useHouseholdStore(), 'householdName').returns(mockHousehold.name)
      cy.stub(useHouseholdStore(), 'householdAddress').returns(mockHousehold.address)
      cy.stub(useHouseholdStore(), 'householdId').returns(mockHousehold.id)
      cy.stub(useHouseholdStore(), 'isOwner').returns(true)
      cy.stub(useHouseholdStore(), 'members').returns(mockMembers)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(true)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(true)
      
      // Visit the household view route with Members tab active
      cy.visit('/household')
      cy.get('button').contains('Medlemmer').click()
    })

    it('should display all members in the household', () => {
      cy.get('div').contains('Test User').should('be.visible')
      cy.get('div').contains('Jane Doe').should('be.visible')
      cy.get('div').contains('Guest User').should('be.visible')
    })

    it('should open add member form when "Legg til" button is clicked', () => {
      cy.stub(useHouseholdStore(), 'openAddMemberForm').as('openAddForm')
      cy.get('button').contains('Legg til').click()
      cy.get('@openAddForm').should('have.been.called')
    })

    it('should open invite form when "Inviter" button is clicked', () => {
      cy.stub(useHouseholdStore(), 'openInviteForm').as('openInviteForm')
      cy.get('button').contains('Inviter').click()
      cy.get('@openInviteForm').should('have.been.called')
    })
  })

  describe('Search Tab', () => {
    beforeEach(() => {
      // Mock household store for search functionality
      const mockHousehold = {
        id: 'h1', 
        name: 'My Test Home', 
        address: 'Testvegen 123, Oslo', 
        ownerId: 'user1'
      }
      
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(true)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(mockHousehold)
      cy.stub(useHouseholdStore(), 'householdId').returns(mockHousehold.id)
      cy.stub(useHouseholdStore(), 'isOwner').returns(false)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(true)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(true)
      
      // Visit the household view and switch to search tab
      cy.visit('/household')
      cy.get('button').contains('Søk husstand').click()
    })

    it('should search for a household when search button is clicked', () => {
      const searchHouseholdStub = cy.stub().resolves({ id: 'h2', name: 'Target House' })
      cy.stub(useHouseholdStore(), 'searchHouseholdById').as('searchHousehold').callsFake(searchHouseholdStub)
      
      cy.get('input#joinHouseholdId').type('H2')
      cy.get('button').contains('Søk').click()
      cy.get('@searchHousehold').should('have.been.calledWith', 'H2')
      
      // Mock the foundHousehold state after search
      cy.get('div').contains('Husstand funnet').should('be.visible')
      cy.get('div').contains('Target House').should('be.visible')
    })

    it('should show error when household not found', () => {
      cy.stub(useHouseholdStore(), 'searchHouseholdById').rejects(new Error('Ingen husstand funnet'))
      
      cy.get('input#joinHouseholdId').type('INVALID')
      cy.get('button').contains('Søk').click()
      cy.get('p').contains('Ingen husstand funnet').should('be.visible')
    })

    it('should send join request when "Send forespørsel" button is clicked', () => {
      const sendJoinRequestStub = cy.stub().resolves(true)
      cy.stub(useHouseholdStore(), 'sendJoinRequest').as('sendJoinRequest').callsFake(sendJoinRequestStub)
      cy.stub(useHouseholdStore(), 'searchHouseholdById').resolves({ id: 'h2', name: 'Target House' })
      
      cy.get('input#joinHouseholdId').type('H2')
      cy.get('button').contains('Søk').click()
      cy.get('button').contains('Send forespørsel').click()
      cy.get('@sendJoinRequest').should('have.been.calledWith', 'h2')
      cy.get('p').contains('Forespørsel sendt!').should('be.visible')
    })

    it('should show error when owner tries to join another household', () => {
      cy.stub(useHouseholdStore(), 'isOwner').returns(true)
      cy.stub(useHouseholdStore(), 'searchHouseholdById').resolves({ id: 'h2', name: 'Target House' })
      
      cy.get('input#joinHouseholdId').type('H2')
      cy.get('button').contains('Søk').click()
      cy.get('button').contains('Send forespørsel').click()
      cy.get('p').contains('Du er eier av en husstand').should('be.visible')
    })
  })

  describe('Membership Operations', () => {
    beforeEach(() => {
      // Mock the household store for operations
      const mockHousehold = {
        id: 'h1', 
        name: 'My Test Home', 
        address: 'Testvegen 123, Oslo', 
        ownerId: 'user1'
      }
      
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(true)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(mockHousehold)
      cy.stub(useHouseholdStore(), 'isOwner').returns(false)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(true)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(true)
      
      cy.visit('/household')
    })

    it('should allow non-owner to leave household', () => {
      const leaveHouseholdStub = cy.stub().resolves(true)
      cy.stub(useHouseholdStore(), 'leaveHousehold').as('leaveHousehold').callsFake(leaveHouseholdStub)
      
      cy.get('button').contains('Forlat').click()
      cy.contains('Forlat husstand').should('be.visible')
      cy.get('button').contains('Bekreft').click()
      cy.get('@leaveHousehold').should('have.been.called')
      cy.contains('Du har forlatt husstanden').should('be.visible')
    })

    it('should allow owner to delete household', () => {
      cy.stub(useHouseholdStore(), 'isOwner').returns(true)
      const deleteHouseholdStub = cy.stub().resolves(true)
      cy.stub(useHouseholdStore(), 'deleteHousehold').as('deleteHousehold').callsFake(deleteHouseholdStub)
      
      cy.get('button').contains('Slett').click()
      cy.contains('Slett husstand').should('be.visible')
      cy.get('button').contains('Bekreft').click()
      cy.get('@deleteHousehold').should('have.been.called')
      cy.contains('Husstand slettet').should('be.visible')
    })
  })

  describe('Invitation Management', () => {
    beforeEach(() => {
      // Mock household with no household
      cy.stub(useHouseholdStore(), 'hasHousehold').returns(false)
      cy.stub(useHouseholdStore(), 'currentHousehold').returns(null)
      cy.stub(useHouseholdStore(), 'checkCurrentHousehold').resolves(false)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(false)
      
      // Mock received invitations
      const mockInvitations = [
        { 
          id: 'inv1', 
          householdId: 'h1', 
          householdName: 'Test Household', 
          status: 'PENDING' 
        }
      ]
      
      cy.stub(useHouseholdStore(), 'receivedInvitations').returns(mockInvitations)
      cy.stub(useHouseholdStore(), 'fetchReceivedInvitations').resolves(mockInvitations)
      
      cy.visit('/household')
    })

    it('should allow user to accept invitation', () => {
      const acceptInvitationStub = cy.stub().resolves(true)
      cy.stub(useHouseholdStore(), 'acceptInvitation').as('acceptInvitation').callsFake(acceptInvitationStub)
      cy.stub(useHouseholdStore(), 'loadHouseholdData').resolves(true)
      
      cy.contains('Test Household').should('be.visible')
      cy.get('button').contains('Aksepter').click()
      cy.get('@acceptInvitation').should('have.been.calledWith', 'inv1')
      cy.contains('Invitasjon akseptert').should('be.visible')
    })

    it('should allow user to decline invitation', () => {
      const declineInvitationStub = cy.stub().resolves(true)
      cy.stub(useHouseholdStore(), 'declineInvitation').as('declineInvitation').callsFake(declineInvitationStub)
      
      cy.contains('Test Household').should('be.visible')
      cy.get('button').contains('Avslå').click()
      cy.get('@declineInvitation').should('have.been.calledWith', 'inv1')
      cy.contains('Invitasjon avslått').should('be.visible')
    })
  })
})