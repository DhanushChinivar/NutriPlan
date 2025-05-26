// cypress/e2e/account.cy.js

describe('NutriPlan - Account Actions', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('#register-form').invoke('addClass', 'hidden');
    cy.get('#login-form').invoke('removeClass', 'hidden');
    cy.get('#login-form').should('be.visible');

    cy.get('#loginForm input[name="email"]').as('emailInput').should('exist').and('be.visible').clear().type('testuser@nutriplan.com');
    cy.get('#loginForm input[name="password"]').as('passInput').should('exist').and('be.visible').clear().type('Password123!');
    cy.get('#loginForm button[type="submit"]').click();

    // Wait for dashboard or info page
    cy.location('pathname', { timeout: 10000 }).should((path) => {
      expect(['/dashboard', '/info']).to.include(path);
    });
  });

  it('should allow user to logout', () => {
    cy.visit('/dashboard');
    cy.contains('a.logout', /log out/i).should('exist').click();
    cy.url({ timeout: 5000 }).should('include', '/');
  });

  it('should update user info successfully', () => {
    cy.visit('/info?update=true');

    // Skip next buttons and jump directly to step 3 if not hidden
    cy.get('#step2').invoke('removeClass', 'hidden');
    cy.get('#step3').invoke('removeClass', 'hidden');

    cy.get('input[name="age"]', { timeout: 5000 })
      .should('exist')
      .and('be.visible')
      .clear({ force: true })
      .type('31', { force: true });

    cy.get('input[name="height"]').clear({ force: true }).type('170', { force: true });
    cy.get('input[name="weight"]').clear({ force: true }).type('65', { force: true });
    cy.get('select[name="gender"]').select('male', { force: true });
    cy.get('select[name="dietType"]').select('balanced', { force: true });
    cy.get('select[name="mealsPerDay"]').select('3', { force: true });
    cy.get('select[name="goalType"]').select('maintenance', { force: true });
    cy.get('select[name="activityLevel"]').select('moderate', { force: true });
    cy.get('#submitBtn').should('be.visible').click({ force: true });

    cy.on('window:alert', (text) => {
      expect(text).to.include('Preferences saved successfully');
    });
  });

  it('should show alert if age is missing', () => {
    cy.visit('/info?update=true');

    cy.get('#step2').invoke('removeClass', 'hidden');
    cy.get('#step3').invoke('removeClass', 'hidden');

    cy.get('input[name="age"]', { timeout: 5000 })
      .should('exist')
      .and('be.visible')
      .clear({ force: true });

    cy.get('#submitBtn').should('be.visible').click({ force: true });

    cy.on('window:alert', (text) => {
      expect(text.toLowerCase()).to.include('required');
    });
  });
});
