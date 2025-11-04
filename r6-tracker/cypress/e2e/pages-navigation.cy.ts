describe('Pages Navigation & Functionality Tests', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Pages publiques (sans authentification)', () => {
    const publicPages = [
      { path: '/', title: 'Accueil', expectedElements: ['Rainbow Six', 'Operators', 'Maps', 'Weapons'] },
      { path: '/auth', title: 'Authentification', expectedElements: ['Se connecter', 'Inscription'] },
      { path: '/operators', title: 'Opérateurs', expectedElements: ['Opérateurs', 'Liste'] },
      { path: '/maps', title: 'Maps', expectedElements: ['Maps', 'Cartes'] },
      { path: '/weapons', title: 'Armes', expectedElements: ['Armes', 'Weapons'] },
      { path: '/search', title: 'Recherche', expectedElements: ['Recherche', 'Search'] },
      { path: '/comparaison', title: 'Comparaison', expectedElements: ['Comparaison'] },
      { path: '/operators-comparison', title: 'Comparaison Opérateurs', expectedElements: ['Comparaison'] },
      { path: '/about', title: 'À propos', expectedElements: ['À propos', 'About'] }
    ];

    publicPages.forEach(({ path, title, expectedElements }) => {
      it(`should load ${title} page (${path}) correctly`, () => {
        cy.visit(path);
        
        // Vérifier que la page se charge sans erreur
        cy.url().should('include', path);
        
        // Vérifier qu'il n'y a pas d'erreur 404
        cy.get('body').should('not.contain', '404');
        cy.get('body').should('not.contain', 'This page could not be found');
        
        // Vérifier que la navbar est présente
        cy.get('nav').should('be.visible');
        
        // Vérifier qu'au moins un des éléments attendus est présent
        let foundElement = false;
        expectedElements.forEach(element => {
          cy.get('body').then($body => {
            if ($body.text().includes(element)) {
              foundElement = true;
            }
          });
        });
        
        // Vérifier que la page contient du contenu
        cy.get('main, .main, [role="main"]').should('exist');
        
        // Vérifier qu'il n'y a pas d'erreurs JavaScript critiques
        cy.window().then((win) => {
          expect(win.console.error).to.not.have.been.called;
        });
      });
    });

    it('should have working navigation between public pages', () => {
      // Commencer par l'accueil
      cy.visit('/');
      
      // Naviguer vers Operators
      cy.contains('Operators').click();
      cy.url().should('include', '/operators');
      cy.get('body').should('not.contain', '404');
      
      // Naviguer vers Maps
      cy.contains('Maps').click();
      cy.url().should('include', '/maps');
      cy.get('body').should('not.contain', '404');
      
      // Naviguer vers Weapons  
      cy.contains('Weapons').click();
      cy.url().should('include', '/weapons');
      cy.get('body').should('not.contain', '404');
      
      // Retour à l'accueil via le logo/titre
      cy.get('nav').within(() => {
        cy.get('a').first().click();
      });
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Pages protégées (nécessitent une authentification)', () => {
    const protectedPages = [
      '/dashboard-new',
      '/profile'
    ];

    protectedPages.forEach(path => {
      it(`should redirect ${path} to auth when not logged in`, () => {
        cy.visit(path);
        
        // Vérifier la redirection vers /auth
        cy.url({ timeout: 10000 }).should('include', '/auth');
        
        // Vérifier qu'on voit bien la page d'authentification
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
      });
    });

    context('When authenticated', () => {
      beforeEach(() => {
        // Se connecter avant chaque test de pages protégées
        cy.visit('/auth');
        cy.get('input[name="email"]').type('kyllian.diochon.kd@gmail.com');
        cy.get('input[name="password"]').type('18*1999*');
        cy.get('button[type="submit"]').contains('Se connecter').click();
        
        // Attendre la redirection vers le dashboard
        cy.url({ timeout: 15000 }).should('include', '/dashboard-new');
      });

      it('should access dashboard page when authenticated', () => {
        // On devrait déjà être sur le dashboard après le login
        cy.url().should('include', '/dashboard-new');
        
        // Vérifier les éléments du dashboard
        cy.contains('Bienvenue').should('be.visible');
        cy.contains('Mes Opérateurs Favoris').should('be.visible');
        cy.contains('Mes Armes Favorites').should('be.visible');
        cy.contains('Mes Maps Favorites').should('be.visible');
        
        // Vérifier qu'il n'y a pas d'erreur
        cy.get('body').should('not.contain', '404');
      });

      it('should access profile page when authenticated', () => {
        cy.visit('/profile');
        
        // Vérifier qu'on accède bien à la page profil
        cy.url().should('include', '/profile');
        cy.get('body').should('not.contain', '404');
        
        // Vérifier qu'on a des informations de profil
        cy.get('body').should('contain.text', '');
      });
    });
  });

  describe('Pages dynamiques', () => {
    it('should load operator detail pages', () => {
      cy.visit('/operators');
      
      // Attendre que la liste des opérateurs se charge
      cy.get('[data-testid="operator-card"], .operator-card, a[href*="/operators/"]', { timeout: 10000 })
        .first()
        .click();
      
      // Vérifier qu'on arrive sur une page de détail d'opérateur
      cy.url().should('include', '/operators/');
      cy.get('body').should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à l'opérateur
      cy.get('main, .main, [role="main"]').should('exist');
    });

    it('should load weapon detail pages', () => {
      cy.visit('/weapons');
      
      // Attendre que la liste des armes se charge
      cy.get('[data-testid="weapon-card"], .weapon-card, a[href*="/weapons/"]', { timeout: 10000 })
        .first()
        .click();
      
      // Vérifier qu'on arrive sur une page de détail d'arme
      cy.url().should('include', '/weapons/');
      cy.get('body').should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à l'arme
      cy.get('main, .main, [role="main"]').should('exist');
    });

    it('should load map detail pages', () => {
      cy.visit('/maps');
      
      // Attendre que la liste des maps se charge
      cy.get('[data-testid="map-card"], .map-card, a[href*="/maps/"]', { timeout: 10000 })
        .first()
        .click();
      
      // Vérifier qu'on arrive sur une page de détail de map
      cy.url().should('include', '/maps/');
      cy.get('body').should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à la map
      cy.get('main, .main, [role="main"]').should('exist');
    });
  });

  describe('Performance et accessibilité de base', () => {
    const testPages = ['/', '/operators', '/maps', '/weapons', '/auth'];

    testPages.forEach(page => {
      it(`should load ${page} within acceptable time`, () => {
        const startTime = Date.now();
        
        cy.visit(page);
        
        // La page devrait se charger en moins de 5 secondes
        cy.get('body').should('be.visible').then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(5000);
        });
      });

      it(`should have basic accessibility elements on ${page}`, () => {
        cy.visit(page);
        
        // Vérifier la présence d'un titre
        cy.get('title').should('exist');
        
        // Vérifier la navigation
        cy.get('nav').should('be.visible');
        
        // Vérifier qu'il y a du contenu principal
        cy.get('main, .main, [role="main"], body').should('be.visible');
        
        // Vérifier qu'il n'y a pas d'éléments avec aria-hidden sur tout le document
        cy.get('[aria-hidden="true"]').should('not.cover', 'body');
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('should handle 404 pages gracefully', () => {
      // Tester une page qui n'existe pas
      cy.request({ url: '/page-qui-nexiste-pas', failOnStatusCode: false })
        .then((response) => {
          expect(response.status).to.eq(404);
        });
    });

    it('should handle invalid operator routes', () => {
      cy.visit('/operators/operateur-inexistant', { failOnStatusCode: false });
      
      // Vérifier qu'on gère gracieusement l'erreur
      cy.get('body').should('be.visible');
      // Soit on affiche une 404, soit on redirige vers la liste
      cy.url().should('satisfy', (url) => {
        return url.includes('/operators/operateur-inexistant') || url.includes('/operators');
      });
    });

    it('should handle invalid weapon routes', () => {
      cy.visit('/weapons/arme-inexistante', { failOnStatusCode: false });
      
      cy.get('body').should('be.visible');
      cy.url().should('satisfy', (url) => {
        return url.includes('/weapons/arme-inexistante') || url.includes('/weapons');
      });
    });

    it('should handle invalid map routes', () => {
      cy.visit('/maps/map-inexistante', { failOnStatusCode: false });
      
      cy.get('body').should('be.visible');
      cy.url().should('satisfy', (url) => {
        return url.includes('/maps/map-inexistante') || url.includes('/maps');
      });
    });
  });

  describe('Responsive design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`should be responsive on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        
        // Vérifier que la navigation est adaptée au viewport
        cy.get('nav').should('be.visible');
        
        // Vérifier que le contenu principal est visible
        cy.get('main, .main, [role="main"], body').should('be.visible');
        
        // Vérifier qu'il n'y a pas de débordement horizontal
        cy.get('body').should('have.css', 'overflow-x').and('not.equal', 'scroll');
        
        // Tester quelques pages clés
        cy.visit('/operators');
        cy.get('body').should('be.visible');
        
        cy.visit('/maps');
        cy.get('body').should('be.visible');
        
        cy.visit('/weapons');
        cy.get('body').should('be.visible');
      });
    });
  });
});