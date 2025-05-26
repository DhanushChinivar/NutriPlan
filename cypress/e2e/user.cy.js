describe('NutriPlan - User Preferences', () => {
beforeEach(() => {
  cy.visit('/login');

  cy.get('#register-form').invoke('addClass', 'hidden');
  cy.get('#login-form').invoke('removeClass', 'hidden');

  cy.get('#loginForm input[name="email"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .as('emailInput');

  cy.get('#loginForm input[name="password"]')
    .should('exist')
    .should('be.visible')
    .as('passInput');

  cy.get('@emailInput').clear().type('testuser@nutriplan.com');
  cy.get('@passInput').clear().type('Password123!');

  cy.get('#loginForm button[type="submit"]').click();

  // Wait for either /dashboard or /info
  cy.location('pathname', { timeout: 10000 }).should((path) => {
    expect(['/dashboard', '/info']).to.include(path);
  });

  // Navigate to info for preference test
  cy.visit('/info');
});


  it('should show validation error on empty submit', () => {
    cy.get('form').submit();

    cy.on('window:alert', (alertText) => {
      expect(alertText.toLowerCase()).to.include('required'); // Or adapt to your actual alert
    });
  });

  it('should save valid user preferences', () => {
    cy.get('input[name="age"]').type('30');
    cy.get('input[name="height"]').type('170');
    cy.get('input[name="weight"]').type('60');
    cy.get('select[name="gender"]').select('male');

    cy.get('#nextBtn').click();

    cy.get('select[name="dietType"]').select('vegetarian');
    cy.get('input[name="allergies"][value="nuts"]').check();
    cy.get('select[name="mealsPerDay"]').select('3');

    cy.get('#nextBtn').click();

    cy.get('select[name="goalType"]').select('weight_loss');
    cy.get('select[name="activityLevel"]').select('moderate');

    cy.get('#submitBtn').click();

    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('success');
    });
  });
});

