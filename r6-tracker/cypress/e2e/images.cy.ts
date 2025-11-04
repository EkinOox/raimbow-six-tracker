describe('Images Loading Tests', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Home Page Images', () => {
    it('should load all images on home page without 400 errors', () => {
      // Intercepter toutes les requêtes d'images
      cy.intercept('GET', '**/*.{png,jpg,jpeg,gif,svg,webp,avif}').as('imageRequests');
      
      cy.visit('/');
      
      // Attendre que la page se charge complètement
      cy.get('body').should('be.visible');
      
      // Vérifier que toutes les images sont visibles
      cy.get('img').should('be.visible');
      
      // Vérifier qu'il n'y a pas d'images cassées
      cy.get('img').each(($img) => {
        // Vérifier que l'image a une source
        expect($img.attr('src')).to.not.be.empty;
        
        // Vérifier que l'image n'a pas d'erreur de chargement
        cy.wrap($img).should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
      });
      
      // Attendre quelques requêtes d'images
      cy.wait('@imageRequests', { timeout: 10000 }).then((interception) => {
        // Vérifier qu'il n'y a pas d'erreur 400
        expect(interception.response.statusCode).to.not.equal(400);
        expect(interception.response.statusCode).to.be.oneOf([200, 304, 206]);
      });
    });

    it('should load hero image correctly', () => {
      cy.visit('/');
      
      // Vérifier que l'image hero se charge
      cy.get('img[alt="R6 Background"]').should('be.visible');
      cy.get('img[alt="R6 Background"]').should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
    });

    it('should load logo image correctly', () => {
      cy.visit('/');
      
      // Vérifier que le logo se charge
      cy.get('img[alt="R6 Tracker Logo"]').should('be.visible');
      cy.get('img[alt="R6 Tracker Logo"]').should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
    });

    it('should load presentation image correctly', () => {
      cy.visit('/');
      
      // Vérifier que l'image de présentation se charge
      cy.get('img[alt="Rainbow Six Siege Gameplay"]').should('be.visible');
      cy.get('img[alt="Rainbow Six Siege Gameplay"]').should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
    });

    it('should load all feature images correctly', () => {
      cy.visit('/');
      
      const expectedFeatures = [
        'Recherche Avancée',
        'Statistiques Détailées', 
        'Comparaison',
        'Opérateurs',
        'Armes',
        'Cartes'
      ];
      
      expectedFeatures.forEach((featureTitle) => {
        cy.get(`img[alt="${featureTitle}"]`).should('be.visible');
        cy.get(`img[alt="${featureTitle}"]`).should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
      });
    });
  });

  describe('Network Error Handling', () => {
    it('should handle image loading errors gracefully', () => {
      // Simuler des erreurs de chargement d'images
      cy.intercept('GET', '**/feature-*.svg', { statusCode: 404 }).as('imageErrors');
      
      cy.visit('/');
      
      // Vérifier que la page reste fonctionnelle même avec des images manquantes
      cy.get('body').should('be.visible');
      cy.contains('Fonctionnalités Principales').should('be.visible');
      
      // Vérifier qu'il n'y a pas d'erreurs JavaScript critiques
      cy.window().then((win) => {
        // Les erreurs d'images ne devraient pas casser la page
        cy.get('h3').contains('Recherche Avancée').should('be.visible');
      });
    });

    it('should not have any 400 status code responses', () => {
      // Intercepter toutes les requêtes et vérifier qu'aucune ne retourne 400
      cy.intercept('GET', '**/*').as('allRequests');
      
      cy.visit('/');
      
      // Attendre le chargement complet
      cy.get('body').should('be.visible');
      
      // Vérifier les requêtes interceptées
      cy.get('@allRequests.all').then((interceptions) => {
        interceptions.forEach((interception) => {
          if (interception.response) {
            expect(interception.response.statusCode).to.not.equal(400);
          }
        });
      });
    });
  });

  describe('Image Performance', () => {
    it('should load images efficiently', () => {
      const startTime = Date.now();
      
      cy.visit('/');
      
      // Vérifier que toutes les images se chargent en temps raisonnable
      cy.get('img').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000); // Moins de 10 secondes
      });
    });

    it('should use appropriate image formats', () => {
      cy.visit('/');
      
      // Vérifier que les images utilisent des formats modernes ou appropriés
      cy.get('img').each(($img) => {
        const src = $img.attr('src');
        expect(src).to.satisfy((url) => {
          return url.includes('.svg') || 
                 url.includes('.avif') || 
                 url.includes('.webp') || 
                 url.includes('.png') || 
                 url.includes('.jpg') || 
                 url.includes('.jpeg');
        });
      });
    });
  });

  describe('Responsive Images', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`should display images correctly on ${name}`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        
        // Vérifier que les images s'adaptent au viewport
        cy.get('img').should('be.visible');
        
        // Vérifier qu'aucune image ne déborde
        cy.get('img').each(($img) => {
          const imgWidth = $img[0].getBoundingClientRect().width;
          expect(imgWidth).to.be.lessThan(width + 50); // Petite marge d'erreur
        });
      });
    });
  });

  describe('Accessibility Images', () => {
    it('should have proper alt text for all images', () => {
      cy.visit('/');
      
      // Vérifier que toutes les images ont un attribut alt
      cy.get('img').each(($img) => {
        expect($img.attr('alt')).to.not.be.empty;
        expect($img.attr('alt')).to.not.be.undefined;
      });
    });

    it('should not have decorative images without proper alt', () => {
      cy.visit('/');
      
      // Les images décoratives devraient avoir alt="" ou un alt descriptif
      cy.get('img').each(($img) => {
        const alt = $img.attr('alt');
        // Alt ne devrait pas être juste des espaces ou undefined
        expect(alt).to.not.match(/^\s*$/);
      });
    });
  });
});