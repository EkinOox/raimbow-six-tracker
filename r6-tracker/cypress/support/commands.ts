// ***********************************************
// Commandes Cypress personnalisées pour R6 Tracker
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Commande personnalisée pour se connecter
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Commande personnalisée pour se déconnecter
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Commande personnalisée pour attendre que Next.js soit prêt
       * @example cy.waitForNextJs()
       */
      waitForNextJs(): Chainable<void>;
      
      /**
       * Commande personnalisée pour vérifier l'authentification
       * @example cy.checkAuthenticated()
       */
      checkAuthenticated(): Chainable<void>;
    }
  }
}

// Commande de connexion
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/auth');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').contains('Connexion').click();
      
      // Attendre la redirection après connexion
      cy.url().should('not.include', '/auth');
      
      // Vérifier que la session est établie
      cy.getCookie('next-auth.session-token').should('exist');
    },
    {
      validate() {
        // Valider que la session est toujours active
        cy.getCookie('next-auth.session-token').should('exist');
      },
    }
  );
});

// Commande de déconnexion
Cypress.Commands.add('logout', () => {
  cy.visit('/');
  cy.get('button').contains('Déconnexion').click();
  cy.getCookie('next-auth.session-token').should('not.exist');
});

// Commande pour attendre Next.js
Cypress.Commands.add('waitForNextJs', () => {
  // Attendre que Next.js soit complètement chargé
  cy.get('[data-nextjs-scroll-focus-boundary]', { timeout: 10000 }).should('exist');
});

// Commande pour vérifier l'authentification
Cypress.Commands.add('checkAuthenticated', () => {
  cy.getCookie('next-auth.session-token').should('exist');
  cy.get('button').contains('Profil').should('exist');
});

export {};
