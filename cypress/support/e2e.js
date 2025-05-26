// Support file for Cypress tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore known app-side error (like missing DOM elements)
  console.warn("Caught uncaught exception: ", err.message);
  return false;
});
