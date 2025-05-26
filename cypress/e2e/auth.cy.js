
describe('NutriPlan - Authentication Flow', () => {
  it('should load the login page and fail with wrong credentials', () => {
    cy.visit('/login');

    cy.get('#loginForm input[name="email"]:visible').type('invalid@user.com');
    cy.get('#loginForm input[name="password"]:visible').type('wrongpassword');

    cy.on('window:alert', (text) => {
      // Match both possible error alerts
      expect(text.toLowerCase()).to.match(/login failed|unexpected error/);
    });

    cy.get('#loginForm').submit();
  });

  it('should register a new user', () => {
    cy.visit('/login');
    cy.window().then((win) => win.toggleForm('register')); // Show register form

    cy.get('#registerForm input[name="firstName"]:visible').type('Test');
    cy.get('#registerForm input[name="lastName"]:visible').type('User');
    cy.get('#registerForm input[name="email"]:visible').type('testuser@nutriplan.com');
    cy.get('#registerForm input[name="password"]:visible').type('Password123!');
    cy.get('#registerForm input[name="confirmPassword"]:visible').type('Password123!');
    cy.get('#registerForm').submit();

    // Expect alert with registration success message
    cy.on('window:alert', (text) => {
      expect(text).to.match(/registered|success|account/i);
    });
  });

  it('should login with valid credentials', () => {
    cy.visit('/login');

    cy.get('#loginForm input[name="email"]:visible').type('testuser@nutriplan.com');
    cy.get('#loginForm input[name="password"]:visible').type('Password123!');
    cy.get('#loginForm').submit();

    cy.url().should('satisfy', (url) => {
      return url.includes('/dashboard') || url.includes('/info');
    });
  });
});

