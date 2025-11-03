# Cypress Tests - R6 Tracker

## 🧪 Tests E2E avec Cypress

Ce projet utilise [Cypress](https://www.cypress.io/) pour les tests End-to-End.

---

## 📦 Installation

Cypress est déjà installé en tant que dépendance de développement :

```bash
npm install
```

---

## 🚀 Commandes de test

### Ouvrir l'interface Cypress
```bash
npm run test:open
```

### Lancer tous les tests en mode headless
```bash
npm test
# ou
npm run test:headless
```

### Tests avec navigateur spécifique
```bash
# Chrome
npm run test:chrome

# Firefox
npm run test:firefox
```

---

## 📁 Structure des tests

```
cypress/
├── e2e/                    # Tests End-to-End
│   ├── auth.cy.ts         # Tests d'authentification
│   └── navigation.cy.ts   # Tests de navigation
│
├── fixtures/              # Données de test
│   └── example.json
│
├── support/               # Configuration et commandes
│   ├── commands.ts       # Commandes personnalisées
│   └── e2e.ts           # Config globale
│
├── screenshots/          # Screenshots des tests échoués
└── videos/              # Enregistrements vidéo des tests
```

---

## 🔧 Tests disponibles

### Authentication (auth.cy.ts)
- ✅ Affichage du formulaire de connexion
- ✅ Validation des champs vides
- ✅ Erreurs pour identifiants invalides
- ✅ Formulaire d'inscription
- ✅ Protection des routes (`/profile`, `/dashboard-new`)
- ✅ Redirection vers `/auth` si non connecté

### Navigation (navigation.cy.ts)
- ✅ Chargement de la homepage
- ✅ Navigation dans la navbar
- ✅ Page de recherche
- ✅ Liste des opérateurs avec filtres
- ✅ Liste des armes avec filtres
- ✅ Liste des cartes
- ✅ Menu mobile responsive
- ✅ Page À Propos
- ✅ Tests d'accessibilité

---

## 📝 Commandes personnalisées

### `cy.login(email, password)`
Connexion avec session persistante :
```typescript
cy.login('test@example.com', 'password123');
```

### `cy.logout()`
Déconnexion et suppression de la session :
```typescript
cy.logout();
```

### `cy.checkAuthenticated()`
Vérifier que l'utilisateur est authentifié :
```typescript
cy.checkAuthenticated();
```

### `cy.waitForNextJs()`
Attendre que Next.js soit complètement chargé :
```typescript
cy.waitForNextJs();
```

---

## 🎯 Écrire un nouveau test

Créez un fichier dans `cypress/e2e/` :

```typescript
describe('Mon Feature', () => {
  beforeEach(() => {
    cy.visit('/ma-page');
  });

  it('devrait faire quelque chose', () => {
    cy.get('button').click();
    cy.contains('Succès').should('be.visible');
  });
});
```

---

## ⚙️ Configuration

La configuration se trouve dans `cypress.config.ts` :

- **Base URL** : `http://localhost:3000`
- **Viewport** : 1280x720
- **Timeout** : 10 secondes
- **Retries** : 2 fois en mode CI
- **Vidéos** : Activées
- **Screenshots** : Sur échec uniquement

---

## 🐛 Debugging

### Voir les tests en mode interactif
```bash
npm run test:open
```

### Accéder aux screenshots
Les screenshots des tests échoués sont dans `cypress/screenshots/`

### Voir les vidéos
Les enregistrements sont dans `cypress/videos/`

### Console Cypress
Utilisez `cy.log()` et `cy.debug()` pour debugger :
```typescript
cy.log('Mon message de debug');
cy.get('button').debug();
```

---

## 📊 CI/CD

Pour intégrer Cypress dans votre CI/CD :

```yaml
# .github/workflows/tests.yml
name: Tests E2E

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:headless
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

---

## ✅ Bonnes pratiques

1. **Sélecteurs** : Utiliser `data-testid` plutôt que classes CSS
   ```typescript
   cy.get('[data-testid="submit-button"]').click();
   ```

2. **Attentes** : Utiliser `.should()` plutôt que `.then()`
   ```typescript
   cy.get('button').should('be.visible').click();
   ```

3. **Sessions** : Utiliser `cy.session()` pour les logins
   ```typescript
   cy.session('user', () => {
     // Login logic
   });
   ```

4. **Network** : Intercepter les requêtes API
   ```typescript
   cy.intercept('GET', '/api/operators').as('getOperators');
   cy.wait('@getOperators');
   ```

---

## 📚 Ressources

- [Documentation Cypress](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Real World App Example](https://github.com/cypress-io/cypress-realworld-app)

---

**Dernière mise à jour** : 3 novembre 2025
