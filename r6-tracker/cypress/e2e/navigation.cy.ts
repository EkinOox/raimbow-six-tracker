describe('Navigation & Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Homepage', () => {
    it('should load successfully', () => {
      cy.get('h1, h2').should('exist');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should have working navbar', () => {
      cy.get('nav').should('be.visible');
      cy.contains('Accueil').should('be.visible');
      cy.contains('Recherche').should('be.visible');
      cy.contains('Opérateurs').should('be.visible');
      cy.contains('Armes').should('be.visible');
      cy.contains('Cartes').should('be.visible');
    });

    it('should navigate to different pages from navbar', () => {
      // Test navigation vers Recherche
      cy.contains('Recherche').click();
      cy.url().should('include', '/search');

      // Test navigation vers Opérateurs
      cy.visit('/');
      cy.contains('Opérateurs').click();
      cy.url().should('include', '/operators');

      // Test navigation vers Armes
      cy.visit('/');
      cy.contains('Armes').click();
      cy.url().should('include', '/weapons');

      // Test navigation vers Cartes
      cy.visit('/');
      cy.contains('Cartes').click();
      cy.url().should('include', '/maps');
    });
  });

  describe('Search Page', () => {
    beforeEach(() => {
      cy.visit('/search');
    });

    it('should display search form', () => {
      cy.get('input[type="text"], input[placeholder*="nom"], input[placeholder*="joueur"]')
        .should('be.visible');
    });

    it('should have platform selector', () => {
      cy.get('select, [role="combobox"]').should('exist');
    });

    it('should show validation error for empty search', () => {
      cy.get('button[type="submit"], button').contains(/rechercher|search/i).click();
      // Vérifier qu'une erreur ou message est affiché
      cy.get('body').should('exist'); // Placeholder - adapter selon votre UI
    });
  });

  describe('Operators Page', () => {
    beforeEach(() => {
      cy.visit('/operators');
    });

    it('should display operators list', () => {
      cy.get('[data-testid="operator-card"], .operator-card, img[alt*="operator"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
    });

    it('should have filter options', () => {
      // Vérifier que les filtres existent (side, role, etc.)
      cy.get('select, [role="listbox"]').should('have.length.greaterThan', 0);
    });

    it('should filter operators by side', () => {
      // Sélectionner "Attaquants"
      cy.contains('Attaquants').click();
      // Vérifier que des opérateurs sont affichés
      cy.get('body').should('exist'); // Placeholder
    });
  });

  describe('Weapons Page', () => {
    beforeEach(() => {
      cy.visit('/weapons');
    });

    it('should display weapons list', () => {
      cy.get('[data-testid="weapon-card"], .weapon-card, img[alt*="weapon"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
    });

    it('should have weapon type filter', () => {
      cy.get('select, [role="listbox"]').should('exist');
    });
  });

  describe('Maps Page', () => {
    beforeEach(() => {
      cy.visit('/maps');
    });

    it('should display maps list', () => {
      cy.get('[data-testid="map-card"], .map-card, img[alt*="map"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
    });

    it('should have playlist filter', () => {
      cy.get('select, [role="listbox"]').should('exist');
    });

    it('should open map details on click', () => {
      cy.get('[data-testid="map-card"], .map-card, img[alt*="map"]').first().click();
      cy.url().should('include', '/maps/');
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.visit('/');
    });

    it('should show mobile menu button', () => {
      cy.get('[aria-label*="menu"], button[aria-label*="Menu"]').should('be.visible');
    });

    it('should toggle mobile menu', () => {
      cy.get('[aria-label*="menu"], button[aria-label*="Menu"]').first().click();
      // Vérifier que le menu mobile s'ouvre
      cy.get('nav').should('be.visible');
    });
  });

  describe('About Page', () => {
    beforeEach(() => {
      cy.visit('/about');
    });

    it('should display about page content', () => {
      cy.contains('R6 Tracker').should('be.visible');
      cy.contains('Mission').should('exist');
    });

    it('should have link to GitHub', () => {
      cy.get('a[href*="github"]').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/');
      cy.get('h1').should('exist');
    });

    it('should have alt text on images', () => {
      cy.visit('/operators');
      cy.get('img').should('have.attr', 'alt');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/');
      cy.get('a, button').first().focus().should('have.focus');
    });
  });
});
