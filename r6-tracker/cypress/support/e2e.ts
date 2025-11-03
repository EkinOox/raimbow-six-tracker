// ***********************************************************
// Support file pour Cypress E2E
// Charger les commandes personnalisées et configurations globales
// ***********************************************************

import './commands';

// Configure Cypress behavior
Cypress.on('uncaught:exception', () => {
  // Empêcher Cypress de fail sur les erreurs non catchées
  // Utile pour les erreurs Next.js de dev
  return false;
});

// Configuration globale avant chaque test
beforeEach(() => {
  // Nettoyer les cookies et localStorage
  cy.clearCookies();
  cy.clearLocalStorage();
});
