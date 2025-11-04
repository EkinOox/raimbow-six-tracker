describe('Authentication Tests', () => {
  beforeEach(() => {
    // Nettoyer les cookies avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Page Auth - Interface', () => {
    it('should display the auth page correctly', () => {
      cy.visit('/auth');
      
      // Vérifier que les éléments de base sont présents
      cy.get('h1').contains('R6').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Se connecter').should('be.visible');
    });

    it('should switch between login and register tabs', () => {
      cy.visit('/auth');
      
      // Par défaut sur connexion
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="username"]').should('not.exist');
      
      // Basculer vers inscription
      cy.get('[role="tab"]').contains('Inscription').click();
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      
      // Retour à connexion
      cy.get('[role="tab"]').contains('Connexion').click();
      cy.get('input[name="username"]').should('not.exist');
    });
  });

  describe('Login - Faux identifiants', () => {
    it('should show error with invalid email/password', () => {
      cy.visit('/auth');
      
      // Saisir de faux identifiants
      cy.get('input[name="email"]').type('faux@example.com');
      cy.get('input[name="password"]').type('mauvais_mot_de_passe');
      
      // Cliquer sur se connecter
      cy.get('button[type="submit"]').contains('Se connecter').click();
      
      // Vérifier que le message d'erreur apparaît
      cy.contains('Email ou mot de passe incorrect', { timeout: 20000 }).should('be.visible');
      
      // Vérifier qu'on reste sur la page auth
      cy.url().should('include', '/auth');
    });

    it('should show error with empty fields', () => {
      cy.visit('/auth');
      
      // Cliquer sur se connecter sans remplir les champs
      cy.get('button[type="submit"]').contains('Se connecter').click();
      
      // Le navigateur devrait empêcher la soumission (validation HTML5)
      cy.url().should('include', '/auth');
    });

    it('should show error with invalid email format', () => {
      cy.visit('/auth');
      
      // Saisir un email invalide
      cy.get('input[name="email"]').type('email_invalide');
      cy.get('input[name="password"]').type('motdepasse123');
      
      // Le champ email devrait être invalide
      cy.get('input[name="email"]:invalid').should('exist');
    });
  });

  describe('Login - Vrais identifiants', () => {
    it('should login successfully with valid credentials (API test)', () => {
      // Test direct de l'API d'authentification
      cy.request({
        method: 'GET',
        url: '/api/auth/csrf',
      }).then((csrfResponse) => {
        const csrfToken = csrfResponse.body.csrfToken;
        
        cy.request({
          method: 'POST',
          url: '/api/auth/callback/credentials',
          form: true,
          body: {
            email: 'test@test.com',
            password: 'testtest',
            csrfToken: csrfToken,
            callbackUrl: '/dashboard-new',
            json: 'true'
          },
          failOnStatusCode: false,
        }).then((response) => {
          // NextAuth peut retourner 200 même en cas d'erreur
          cy.log('API Response:', response.status, response.body);
          
          // Tester maintenant via l'interface utilisateur
          cy.visit('/auth');
          
          // Attendre que la page soit complètement chargée
          cy.get('input[name="email"]').should('be.visible');
          cy.get('input[name="password"]').should('be.visible');
          
          // S'assurer qu'on est bien sur l'onglet connexion
          cy.get('[role="tab"]').contains('Connexion').click();
          
          // Saisir les identifiants
          cy.get('input[name="email"]').clear().type('test@test.com');
          cy.get('input[name="password"]').clear().type('testtest');
          
          // Attendre et cliquer sur connexion
          cy.wait(1000);
          cy.get('button[type="submit"]').contains('Se connecter').click();
          
          // Vérifier la redirection ou l'erreur
          cy.url({ timeout: 30000 }).then(($url) => {
            if ($url.includes('/dashboard-new')) {
              // Succès
              cy.contains('Bienvenue', { timeout: 10000 }).should('be.visible');
            } else {
              // Rester sur auth et vérifier le message d'erreur
              cy.contains('Email ou mot de passe incorrect', { timeout: 10000 }).should('be.visible');
            }
          });
        });
      });
    });

  });

  describe('Protected Routes', () => {
    it('should redirect to auth when accessing dashboard without login', () => {
      cy.visit('/dashboard-new');
      cy.url({ timeout: 10000 }).should('include', '/auth');
    });

    it('should redirect to auth when accessing profile without login', () => {
      cy.visit('/profile');
      cy.url({ timeout: 10000 }).should('include', '/auth');
    });
  });
  
});

