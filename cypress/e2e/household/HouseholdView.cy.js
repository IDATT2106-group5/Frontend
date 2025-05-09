// cypress/e2e/household.spec.js

describe('Household Main View (Owner) – no network stubbing', () => {
  const OWNER = {
    email: 'test@user.test',
    password: '12345678'
  };

  beforeEach(() => {
    // 1) log in via custom command (defined in cypress/support/commands.js)
    cy.login(OWNER.email, OWNER.password);

    // 2) visit the household page
    cy.visit('/household');

    // 3) wait for the key UI to appear
    cy.get('[data-cy=household-id]', { timeout: 10000 }).should('be.visible');
  });

  it('displays the household ID and copies it to clipboard', () => {
    // grab the visible ID text
    cy.get('[data-cy=household-id] span').invoke('text').then(rawId => {
      const id = rawId.trim();

      // stub clipboard
      cy.window().then(win => {
        cy.stub(win.navigator.clipboard, 'writeText').resolves();
      });

      // click copy and assert
      cy.get('[data-cy=copy-id-button]').click();
      cy.window()
        .its('navigator.clipboard.writeText')
        .should('have.been.calledWith', id);

      // toast appears
      cy.contains('Husstands-ID kopiert').should('be.visible');
    });
  });

  it('shows truncated household name and address', () => {
    cy.get('[data-cy=household-name]').invoke('text').then(text => {
      const t = text.trim();
      // either full name ≤20, or ends with '...' and ≤23 chars
      expect(t.length).to.be.lte(23);
      if (t.length > 20) {
        expect(t.endsWith('...')).to.be.true;
      }
    });

    cy.get('[data-cy=household-address]').invoke('text').then(text => {
      const t = text.trim();
      expect(t.length).to.be.lte(33);
      if (t.length > 30) {
        expect(t.endsWith('...')).to.be.true;
      }
    });
  });

  it('can open & close the Edit Household modal', () => {
    cy.get('[data-cy=edit-household-button]').click();
    cy.get('[data-cy=edit-household-modal]').should('be.visible');

    cy.get('[data-cy=edit-household-modal] [data-cy=modal-close]').click();
    cy.get('[data-cy=edit-household-modal]').should('not.exist');
  });

  it('can open & close the Add Member modal', () => {
    cy.get('[data-cy=open-add-member]').click();
    cy.get('[data-cy=add-member-modal]').should('be.visible');

    cy.get('[data-cy=add-member-modal] [data-cy=modal-close]').click();
    cy.get('[data-cy=add-member-modal]').should('not.exist');
  });

  it('can open & close the Invite Member modal', () => {
    cy.get('[data-cy=open-invite-member]').click();
    cy.get('[data-cy=invite-member-modal]').should('be.visible');

    cy.get('[data-cy=invite-member-modal] [data-cy=modal-close]').click();
    cy.get('[data-cy=invite-member-modal]').should('not.exist');
  });
});
