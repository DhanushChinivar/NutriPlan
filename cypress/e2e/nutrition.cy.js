Cypress.on('uncaught:exception', () => false); // Prevent test failure on uncaught frontend exceptions

const email = 'testuser@nutriplan.com';
const password = 'Password123!';

function loginViaUI() {
  cy.visit('/login');
  cy.get('#register-form').invoke('addClass', 'hidden');
  cy.get('#login-form').invoke('removeClass', 'hidden');
  cy.get('#loginForm input[name="email"]').should('be.visible').clear().type(email);
  cy.get('#loginForm input[name="password"]').should('be.visible').clear().type(password);
  cy.get('#loginForm button[type="submit"]').click();
  cy.location('pathname', { timeout: 10000 }).should((path) => {
    expect(['/dashboard', '/info']).to.include(path);
  });
}

describe('Nutrition Tracking Tests', () => {
  beforeEach(() => {
    loginViaUI();
    cy.visit('/nutrition');
    cy.url().should('include', '/nutrition');
  });

  it('should display the correct user info in the sidebar', () => {
    cy.get('#userEmail').should('contain', email);
    cy.get('#userName').should('contain', 'Testuser');
  });

  it('should allow adding a nutrition entry', () => {
    const today = new Date().toISOString().split('T')[0];

    cy.get('#date').type(today);
    cy.get('#foodItem').type('Banana');
    cy.get('#calories').type('105');
    cy.get('#protein').type('1.3');
    cy.get('#carbs').type('27');
    cy.get('#fats').type('0.3');

    cy.intercept('POST', '/api/nutrition/save').as('saveEntry');
    cy.intercept('GET', `/api/nutrition/list?email=${email}`).as('fetchEntries');

    cy.get('form#nutritionForm').submit();

    cy.wait('@saveEntry').its('response.statusCode').should('eq', 201);
    cy.wait('@fetchEntries');

    cy.get('#message').should('contain', 'Entry added successfully!');
  });

  it('should render chart or show no data message', () => {
    cy.intercept('GET', `/api/nutrition/list?email=${email}`, {
      statusCode: 200,
      body: []
    }).as('fetchEmptyEntries');

    cy.reload();
    cy.wait('@fetchEmptyEntries');

    cy.get('#noDataMessage').should('be.visible').and('contain', 'No entries available');
  });

});
