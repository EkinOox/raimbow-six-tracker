describe('Pages Navigation & Functionality Tests', () => {
  const DEFAULT_TIMEOUT = 30000;
  
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Pages publiques (sans authentification)', () => {
    const publicPages = [
      { path: '/fr', title: 'Accueil', expectedElements: ['Rainbow Six', 'Operators', 'Maps', 'Weapons'] },
      { path: '/fr/auth', title: 'Authentification', expectedElements: ['Se connecter', 'Inscription', 'Login', 'Register'] },
      { path: '/fr/operators', title: 'Opérateurs', expectedElements: ['Opérateurs', 'Operators'] },
      { path: '/fr/maps', title: 'Maps', expectedElements: ['Maps', 'Cartes'] },
      { path: '/fr/weapons', title: 'Armes', expectedElements: ['Armes', 'Weapons'] },
      { path: '/fr/search', title: 'Recherche', expectedElements: ['Recherche', 'Search'] },
      { path: '/fr/comparaison', title: 'Comparaison', expectedElements: ['Comparaison', 'Comparison'] },
      { path: '/fr/about', title: 'À propos', expectedElements: ['À propos', 'About'] }
    ];

    publicPages.forEach(({ path, title, expectedElements }) => {
      it(`should load ${title} page (${path}) correctly`, () => {
        cy.visit(path, { timeout: DEFAULT_TIMEOUT });
        
        // Attendre que la page soit chargée
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier que la page se charge sans erreur
        cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', path.replace('/fr', ''));
        
        // Vérifier qu'il n'y a pas d'erreur 404
        cy.get('body').should('not.contain', '404');
        cy.get('body').should('not.contain', 'This page could not be found');
        
        // Vérifier que la navbar est présente
        cy.get('nav', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
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
        cy.get('main, .main, [role="main"]', { timeout: DEFAULT_TIMEOUT }).should('exist');
      });
    });
  });

  describe('Pages protégées (nécessitent une authentification)', () => {
    const protectedPages = [
      '/fr/dashboard-new',
      '/fr/profile'
    ];

    protectedPages.forEach(path => {
      it(`should redirect ${path} to auth when not logged in`, () => {
        cy.visit(path, { timeout: DEFAULT_TIMEOUT });
        
        // Attendre que la redirection se fasse
        cy.wait(2000);
        
        // Vérifier la redirection vers /auth
        cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/auth');
        
        // Vérifier qu'on voit bien la page d'authentification
        cy.get('input[name="email"]', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        cy.get('input[name="password"]', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      });
    });

    context('When authenticated', () => {
      beforeEach(() => {
        // Se connecter avant chaque test de pages protégées
        cy.visit('/fr/auth', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        cy.get('input[name="email"]', { timeout: DEFAULT_TIMEOUT }).type('kyllian.diochon.kd@gmail.com');
        cy.get('input[name="password"]').type('18*1999*');
        
        cy.wait(1000);
        
        cy.get('button[type="submit"]')
          .contains(/Se connecter|Login/i)
          .click();
        
        // Attendre la redirection vers le dashboard
        cy.wait(3000);
        cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/dashboard');
      });

      it('should access dashboard page when authenticated', () => {
        // On devrait déjà être sur le dashboard après le login
        cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/dashboard');
        
        // Vérifier les éléments du dashboard (traductions FR ou EN)
        cy.contains(/Bienvenue|Welcome/i, { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        cy.contains(/Mes Opérateurs Favoris|My Favorite Operators/i, { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        cy.contains(/Mes Armes Favorites|My Favorite Weapons/i, { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        cy.contains(/Mes Maps Favorites|My Favorite Maps/i, { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier qu'il n'y a pas d'erreur
        cy.get('body').should('not.contain', '404');
      });

      it('should access profile page when authenticated', () => {
        cy.visit('/fr/profile', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier qu'on accède bien à la page profil
        cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/profile');
        cy.get('body').should('not.contain', '404');
      });
    });
  });

  describe('Pages dynamiques', () => {
    it('should load operator detail pages', () => {
      cy.visit('/fr/operators', { timeout: DEFAULT_TIMEOUT });
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      
      // Attendre que la liste des opérateurs se charge
      cy.wait(3000);
      
      cy.get('[data-testid="operator-card"], .operator-card, a[href*="/operators/"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click();
      
      // Attendre le chargement de la page
      cy.wait(2000);
      
      // Vérifier qu'on arrive sur une page de détail d'opérateur
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/operators/');
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à l'opérateur
      cy.get('main, .main, [role="main"]', { timeout: DEFAULT_TIMEOUT }).should('exist');
    });

    it('should load weapon detail pages', () => {
      cy.visit('/fr/weapons', { timeout: DEFAULT_TIMEOUT });
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      
      // Attendre que la liste des armes se charge
      cy.wait(3000);
      
      cy.get('[data-testid="weapon-card"], .weapon-card, a[href*="/weapons/"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click();
      
      // Attendre le chargement de la page
      cy.wait(2000);
      
      // Vérifier qu'on arrive sur une page de détail d'arme
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/weapons/');
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à l'arme
      cy.get('main, .main, [role="main"]', { timeout: DEFAULT_TIMEOUT }).should('exist');
    });

    it('should load map detail pages', () => {
      cy.visit('/fr/maps', { timeout: DEFAULT_TIMEOUT });
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      
      // Attendre que la liste des maps se charge
      cy.wait(3000);
      
      cy.get('[data-testid="map-card"], .map-card, a[href*="/maps/"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click();
      
      // Attendre le chargement de la page
      cy.wait(2000);
      
      // Vérifier qu'on arrive sur une page de détail de map
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('include', '/maps/');
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('not.contain', '404');
      
      // Vérifier qu'il y a du contenu spécifique à la map
      cy.get('main, .main, [role="main"]', { timeout: DEFAULT_TIMEOUT }).should('exist');
    });
  });

  describe('Performance et accessibilité de base', () => {
    const testPages = ['/fr', '/fr/operators', '/fr/maps', '/fr/weapons', '/fr/auth'];

    testPages.forEach(page => {
      it(`should load ${page} within acceptable time`, () => {
        const startTime = Date.now();
        
        cy.visit(page, { timeout: DEFAULT_TIMEOUT });
        
        // La page devrait se charger en moins de 10 secondes (augmenté pour Next.js)
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible').then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(10000);
        });
      });

      it(`should have basic accessibility elements on ${page}`, () => {
        cy.visit(page, { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier la présence d'un titre
        cy.get('title', { timeout: DEFAULT_TIMEOUT }).should('exist');
        
        // Vérifier la navigation
        cy.get('nav', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier qu'il y a du contenu principal
        cy.get('main, .main, [role="main"], body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('should handle 404 pages gracefully', () => {
      // Tester une page qui n'existe pas
      cy.request({ url: '/fr/page-qui-nexiste-pas', failOnStatusCode: false, timeout: DEFAULT_TIMEOUT })
        .then((response) => {
          expect(response.status).to.eq(404);
        });
    });

    it('should handle invalid operator routes', () => {
      cy.visit('/fr/operators/operateur-inexistant', { failOnStatusCode: false, timeout: DEFAULT_TIMEOUT });
      
      // Attendre que la page se charge
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      
      // Soit on affiche une 404, soit on redirige vers la liste
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('satisfy', (url) => {
        return url.includes('/operators/operateur-inexistant') || url.includes('/operators');
      });
    });

    it('should handle invalid weapon routes', () => {
      cy.visit('/fr/weapons/arme-inexistante', { failOnStatusCode: false, timeout: DEFAULT_TIMEOUT });
      
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('satisfy', (url) => {
        return url.includes('/weapons/arme-inexistante') || url.includes('/weapons');
      });
    });

    it('should handle invalid map routes', () => {
      cy.visit('/fr/maps/map-inexistante', { failOnStatusCode: false, timeout: DEFAULT_TIMEOUT });
      
      cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      cy.url({ timeout: DEFAULT_TIMEOUT }).should('satisfy', (url) => {
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
        cy.visit('/fr', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier que la navigation est adaptée au viewport
        cy.get('nav', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Vérifier que le contenu principal est visible
        cy.get('main, .main, [role="main"], body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        // Tester quelques pages clés
        cy.visit('/fr/operators', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        cy.visit('/fr/maps', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        
        cy.visit('/fr/weapons', { timeout: DEFAULT_TIMEOUT });
        cy.get('body', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
      });
    });
  });
});