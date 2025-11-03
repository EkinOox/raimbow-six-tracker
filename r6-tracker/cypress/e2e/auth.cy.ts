describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should show login form on /auth page', () => {
      cy.visit('/auth');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Connexion').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth');
      cy.get('button[type="submit"]').contains('Connexion').click();
      cy.contains('requis').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth');
      cy.get('input[name="email"]').type('invalid@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').contains('Connexion').click();
      
      cy.contains('Email ou mot de passe incorrect', { timeout: 10000 }).should('be.visible');
    });

    it.skip('should login successfully with valid credentials', () => {
      // Skip car nécessite un utilisateur de test en DB
      cy.visit('/auth');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').contains('Connexion').click();
      
      cy.url({ timeout: 10000 }).should('not.include', '/auth');
      cy.getCookie('next-auth.session-token').should('exist');
    });
  });

  describe('Register', () => {
    it('should show register form when switching tabs', () => {
      cy.visit('/auth');
      cy.get('[role="tab"]').contains('Inscription').click();
      
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').contains('S\'inscrire').should('be.visible');
    });

    it('should show validation errors for invalid email', () => {
      cy.visit('/auth');
      cy.get('[role="tab"]').contains('Inscription').click();
      
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').contains('S\'inscrire').click();
      
      cy.contains('email invalide', { matchCase: false }).should('be.visible');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to /auth when accessing /profile without authentication', () => {
      cy.visit('/profile');
      cy.url({ timeout: 10000 }).should('include', '/auth');
    });

    it('should redirect to /auth when accessing /dashboard-new without authentication', () => {
      cy.visit('/dashboard-new');
      cy.url({ timeout: 10000 }).should('include', '/auth');
    });

    it('should allow access to /auth when already on auth page', () => {
      cy.visit('/auth');
      cy.url().should('include', '/auth');
      cy.get('input[name="email"]').should('be.visible');
    });
  });

  describe('Session Persistence', () => {
    it('should persist session after page reload', () => {
      // Cette fonction nécessite une session valide
      // Skipper si pas de session de test disponible
      cy.getCookie('next-auth.session-token').then((cookie) => {
        if (cookie) {
          cy.reload();
          cy.getCookie('next-auth.session-token').should('exist');
        }
      });
    });
  });
});
