Cypress.on('uncaught:exception', () => false); // Avoid breaking on frontend JS

const email = 'testuser@nutriplan.com';
const password = 'Password123!';

function loginViaUI() {
  cy.visit('/login');

  cy.get('#register-form').invoke('addClass', 'hidden');
  cy.get('#login-form').invoke('removeClass', 'hidden');

  cy.get('#loginForm input[name="email"]').should('be.visible').first().clear().type(email);
  cy.get('#loginForm input[name="password"]').should('be.visible').first().clear().type(password);
  cy.get('#loginForm button[type="submit"]').click();

  cy.location('pathname', { timeout: 10000 }).should((path) => {
    expect(['/dashboard', '/info']).to.include(path);
  });
}

describe('Grocery List Page', () => {
  beforeEach(() => {
    loginViaUI();

    cy.visit('/grocerylist');
    cy.contains('Plan. Shop. Cook.').should('be.visible');
  });

  it('loads grocery list with all categories', () => {
    const categories = ['protein', 'carbs', 'fats', 'fiber'];

    categories.forEach((category) => {
      cy.get('.category h2').contains(new RegExp(category, 'i')).should('be.visible');
      cy.get(`#${category}-list`).should('exist').within(() => {
        cy.get('li').should('have.length.greaterThan', 0);
      });
    });
  });

  it('exports the grocery list as PDF', () => {
    // Intercept the PDF export request
    cy.intercept('GET', '/api/grocery-list/pdf*').as('exportPDF');

    // Click the export button
    cy.get('.export-button')
      .should('be.visible')
      .and('contain', 'Export Grocery List')
      .click();

    // Wait for the backend to be called
    cy.wait('@exportPDF').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.request.url).to.include('/api/grocery-list/pdf');
    });

    // Ensure no error message is displayed
    cy.get('#errorMsg').should('not.contain', 'User not logged in.');
  });
});
