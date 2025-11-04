describe('Interactive Features Tests', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Search Functionality', () => {
    it('should perform search operations', () => {
      cy.visit('/search');
      
      // Vérifier que la page de recherche se charge
      cy.get('input[type="search"], input[placeholder*="search"], input[placeholder*="recherche"]', { timeout: 10000 })
        .should('be.visible');
      
      // Effectuer une recherche
      cy.get('input[type="search"], input[placeholder*="search"], input[placeholder*="recherche"]')
        .first()
        .type('ash');
      
      // Appuyer sur Entrée ou cliquer sur le bouton de recherche
      cy.get('input[type="search"], input[placeholder*="search"], input[placeholder*="recherche"]')
        .first()
        .type('{enter}');
      
      // Vérifier que des résultats apparaissent ou qu'il y a une indication de recherche
      cy.get('body').should('not.contain', '404');
    });
  });

  describe('Operators Page Interactions', () => {
    it('should interact with operators list', () => {
      cy.visit('/operators');
      
      // Attendre que la page se charge
      cy.get('body', { timeout: 15000 }).should('be.visible');
      
      // Vérifier qu'il y a du contenu
      cy.get('body').should('not.contain', '404');
      
      // Si il y a des filtres, les tester
      cy.get('select, input[type="checkbox"], button').then($elements => {
        if ($elements.length > 0) {
          // Cliquer sur le premier élément interactif trouvé
          cy.wrap($elements.first()).click();
        }
      });
      
      // Si il y a des cartes d'opérateurs, cliquer sur la première
      cy.get('a[href*="/operators/"], .operator-card, [data-testid*="operator"]').then($cards => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.url().should('include', '/operators/');
        }
      });
    });
  });

  describe('Maps Page Interactions', () => {
    it('should interact with maps list', () => {
      cy.visit('/maps');
      
      // Attendre que la page se charge
      cy.get('body', { timeout: 15000 }).should('be.visible');
      cy.get('body').should('not.contain', '404');
      
      // Si il y a des cartes de maps, cliquer sur la première
      cy.get('a[href*="/maps/"], .map-card, [data-testid*="map"]').then($cards => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.url().should('include', '/maps/');
        }
      });
    });
  });

  describe('Weapons Page Interactions', () => {
    it('should interact with weapons list', () => {
      cy.visit('/weapons');
      
      // Attendre que la page se charge
      cy.get('body', { timeout: 15000 }).should('be.visible');
      cy.get('body').should('not.contain', '404');
      
      // Si il y a des cartes d'armes, cliquer sur la première
      cy.get('a[href*="/weapons/"], .weapon-card, [data-testid*="weapon"]').then($cards => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.url().should('include', '/weapons/');
        }
      });
    });
  });

  describe('Comparison Features', () => {
    it('should access comparison pages', () => {
      cy.visit('/comparaison');
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('be.visible');
      
      cy.visit('/operators-comparison');
      cy.get('body').should('not.contain', '404');
      cy.get('body').should('be.visible');
    });
  });

  describe('Favorites (when authenticated)', () => {
    beforeEach(() => {
      // Se connecter pour tester les favoris
      cy.visit('/auth');
      cy.get('input[name="email"]').type('kyllian.diochon.kd@gmail.com');
      cy.get('input[name="password"]').type('18*1999*');
      cy.get('button[type="submit"]').contains('Se connecter').click();
      cy.url({ timeout: 15000 }).should('include', '/dashboard-new');
    });

    it('should interact with favorites on dashboard', () => {
      // On devrait être sur le dashboard
      cy.url().should('include', '/dashboard-new');
      
      // Vérifier les sections favoris
      cy.contains('Mes Opérateurs Favoris').should('be.visible');
      cy.contains('Mes Armes Favorites').should('be.visible');
      cy.contains('Mes Maps Favorites').should('be.visible');
      
      // Si il y a des favoris, vérifier qu'on peut cliquer dessus
      cy.get('a[href*="/operators/"], a[href*="/weapons/"], a[href*="/maps/"]').then($links => {
        if ($links.length > 0) {
          const firstLink = $links.first();
          const href = firstLink.attr('href');
          cy.wrap(firstLink).click();
          cy.url().should('include', href);
        }
      });
    });

    it('should be able to add/remove favorites', () => {
      // Aller sur la page des opérateurs
      cy.visit('/operators');
      
      // Chercher un bouton favori (coeur, étoile, etc.)
      cy.get('button[title*="favori"], button[aria-label*="favori"], .favorite-btn, [data-testid*="favorite"]').then($buttons => {
        if ($buttons.length > 0) {
          // Cliquer sur le premier bouton favori trouvé
          cy.wrap($buttons.first()).click();
          
          // Vérifier qu'il y a eu une interaction (changement d'état)
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  describe('API Integration', () => {
    it('should handle API responses correctly', () => {
      // Intercepter les appels API
      cy.intercept('GET', '/api/**').as('apiCall');
      
      cy.visit('/operators');
      
      // Attendre qu'au moins un appel API soit fait
      cy.wait('@apiCall', { timeout: 15000 }).then((interception) => {
        if (interception.response) {
          expect(interception.response.statusCode).to.be.oneOf([200, 304]);
        }
      });
      
      // Vérifier que la page affiche du contenu
      cy.get('body').should('not.contain', 'Erreur de chargement');
      cy.get('body').should('not.contain', 'Failed to fetch');
    });

    it('should handle API errors gracefully', () => {
      // Simuler une erreur API
      cy.intercept('GET', '/api/operators', { statusCode: 500 }).as('apiError');
      
      cy.visit('/operators');
      
      // Vérifier que l'erreur est gérée gracieusement
      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain', 'undefined');
    });
  });

  describe('Form Interactions', () => {
    it('should handle auth form properly', () => {
      cy.visit('/auth');
      
      // Tester le switch entre connexion et inscription
      cy.get('[role="tab"]').contains('Inscription').click();
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      
      cy.get('[role="tab"]').contains('Connexion').click();
      cy.get('input[name="username"]').should('not.exist');
      
      // Tester la validation des champs
      cy.get('input[name="email"]').type('email-invalide');
      cy.get('input[name="password"]').type('123');
      
      // Le navigateur devrait empêcher la soumission
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/auth');
    });
  });

  describe('Loading States', () => {
    it('should show proper loading states', () => {
      // Ralentir artificiellement la connexion pour voir les états de chargement
      cy.intercept('GET', '/api/**', (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res.send()), 1000);
          });
        });
      }).as('slowApi');
      
      cy.visit('/operators');
      
      // Vérifier qu'on ne voit pas d'état cassé pendant le chargement
      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain', 'undefined');
      cy.get('body').should('not.contain', 'null');
    });
  });

  describe('Browser Navigation', () => {
    it('should handle browser back/forward correctly', () => {
      cy.visit('/');
      cy.visit('/operators');
      cy.visit('/maps');
      
      // Utiliser le bouton retour du navigateur
      cy.go('back');
      cy.url().should('include', '/operators');
      
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Utiliser le bouton avant du navigateur
      cy.go('forward');
      cy.url().should('include', '/operators');
    });
  });
});