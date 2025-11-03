# Guide de Test - R6 Tracker

## 🎯 Vue d'ensemble

Ce guide explique comment tester l'application après la migration NextAuth et l'implémentation de Cypress.

---

## ✅ Prérequis

### 1. Vérification de l'environnement

```bash
# Naviguer vers le projet
cd /Users/ekinoox/Documents/GitHub/raimbow-six-tracker/r6-tracker

# Vérifier Node.js (minimum v18)
node --version

# Vérifier les dépendances
npm list cypress
npm list next-auth
```

### 2. Variables d'environnement

Vérifier `.env.local` contient:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# JWT (legacy, peut être supprimé à terme)
JWT_SECRET=your-jwt-secret
```

⚠️ **Important**: `NEXTAUTH_SECRET` doit être défini et unique !

```bash
# Générer un nouveau secret si nécessaire
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 Tests Manuels

### 1. Lancer le serveur de développement

```bash
npm run dev
```

**Vérifications**:
- ✅ Serveur démarre sur http://localhost:3000
- ✅ Pas d'erreurs de compilation
- ✅ Console claire (pas d'erreurs React)

### 2. Tester l'inscription

1. Naviguer vers http://localhost:3000/auth
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire:
   - Username: `TestUser`
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
   - Uplay Profile (optionnel): `TestPlayer`
4. Cliquer sur "S'inscrire"

**Résultats attendus**:
- ✅ Redirection vers `/dashboard-new`
- ✅ Message de bienvenue avec username
- ✅ Email affiché
- ✅ Uplay profile affiché (si renseigné)

### 3. Tester la déconnexion

1. Dans la Navbar, cliquer sur le menu utilisateur
2. Cliquer sur "Se déconnecter"

**Résultats attendus**:
- ✅ Redirection vers `/auth`
- ✅ Formulaire de connexion affiché
- ✅ Session effacée (vérifier avec DevTools → Application → Cookies)

### 4. Tester la connexion

1. Sur http://localhost:3000/auth
2. Remplir le formulaire:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Cliquer sur "Se connecter"

**Résultats attendus**:
- ✅ Redirection vers `/dashboard-new`
- ✅ Session restaurée
- ✅ Cookie `next-auth.session-token` présent

### 5. Tester la persistance de session

1. Connecté, naviguer vers http://localhost:3000/profile
2. Rafraîchir la page (F5)

**Résultats attendus**:
- ✅ Toujours connecté après refresh
- ✅ Pas de redirection vers `/auth`
- ✅ Données utilisateur affichées

### 6. Tester les pages protégées

**Sans connexion**:
1. Se déconnecter
2. Essayer d'accéder à:
   - http://localhost:3000/profile
   - http://localhost:3000/dashboard-new

**Résultats attendus**:
- ✅ Redirection automatique vers `/auth`
- ✅ Message ou paramètre `callbackUrl` dans l'URL

### 7. Tester les favoris

**Avec connexion**:
1. Naviguer vers http://localhost:3000/operators
2. Cliquer sur l'icône ⭐ d'un opérateur
3. Vérifier que l'étoile devient pleine

**Résultats attendus**:
- ✅ Toast de confirmation
- ✅ État du favori mis à jour
- ✅ Pas d'erreur dans la console
- ✅ Favori persistant après refresh

**Sans connexion**:
1. Se déconnecter
2. Naviguer vers http://localhost:3000/operators
3. Cliquer sur l'icône ⭐

**Résultats attendus**:
- ✅ Toast "Connectez-vous pour ajouter des favoris"
- ✅ Pas de requête API envoyée

---

## 🤖 Tests Automatisés (Cypress)

### 1. Vérifier l'installation Cypress

```bash
npx cypress verify
```

**Résultat attendu**:
```
✔ Verified Cypress! /Users/.../Cypress.app
```

### 2. Préparer les données de test

**Option A**: Créer un utilisateur test manuellement (recommandé)

Suivre les étapes "Tester l'inscription" ci-dessus avec:
- Email: `test@example.com`
- Password: `Test123!`

**Option B**: Modifier les fixtures Cypress

Éditer `cypress/fixtures/example.json`:

```json
{
  "testUser": {
    "email": "votre-email-test@example.com",
    "password": "VotreMotDePasse123!",
    "username": "VotreUsername"
  }
}
```

### 3. Lancer Cypress en mode interactif

```bash
# Terminal 1: Lancer le serveur dev
npm run dev

# Terminal 2: Ouvrir Cypress
npm run test:open
```

**Interface Cypress**:
1. Choisir "E2E Testing"
2. Sélectionner un navigateur (Chrome recommandé)
3. Cliquer sur "Start E2E Testing"
4. Cliquer sur un fichier de test:
   - `auth.cy.ts` pour tester l'authentification
   - `navigation.cy.ts` pour tester la navigation

### 4. Exécuter les tests en mode headless

```bash
# Tous les tests
npm test

# Tests sur Chrome
npm run test:chrome

# Tests sur Firefox
npm run test:firefox

# Tests en mode verbose
npm run test:headless
```

**Résultats attendus**:
```
  auth.cy.ts
    ✓ should display login form (250ms)
    ✓ should show validation errors (180ms)
    ✓ should handle invalid credentials (350ms)
    ... (12 tests)

  navigation.cy.ts
    ✓ should load the homepage (120ms)
    ✓ should navigate to search page (200ms)
    ... (25+ tests)

  Total: 37 tests passed
```

### 5. Analyser les résultats

**Cypress Dashboard**:
- Vidéos dans `cypress/videos/` (si échec)
- Screenshots dans `cypress/screenshots/` (si échec)
- Rapport dans la console

**Interpréter les échecs**:

```bash
# Test échoué avec erreur "element not found"
→ Vérifier que le serveur dev tourne
→ Vérifier les sélecteurs CSS

# Test échoué avec "session not found"
→ Vérifier NEXTAUTH_SECRET dans .env.local
→ Vérifier que l'utilisateur test existe

# Test échoué avec timeout
→ Augmenter defaultCommandTimeout dans cypress.config.ts
→ Vérifier la performance du serveur
```

---

## 🔍 Vérifications avancées

### 1. Vérifier les cookies (DevTools)

**Chrome/Firefox DevTools**:
1. Ouvrir DevTools (F12)
2. Onglet "Application" → "Cookies"
3. Vérifier les cookies NextAuth:

| Cookie | Valeur | Attributs |
|--------|--------|-----------|
| `next-auth.session-token` | (JWT chiffré) | HttpOnly, SameSite=Lax |
| `next-auth.csrf-token` | (token CSRF) | SameSite=Lax |

⚠️ **Pas de token dans `localStorage` !**

### 2. Vérifier les requêtes API (Network Tab)

**Connexion réussie**:
```
POST /api/auth/callback/credentials
Status: 200
Response: { url: "/dashboard-new" }
```

**Vérifier les favoris**:
```
GET /api/favorites
Cookie: next-auth.session-token=...
Status: 200
Response: { favorites: [...] }
```

⚠️ **Pas de header `Authorization: Bearer` !**

### 3. Vérifier la session NextAuth

**Console navigateur**:
```javascript
// Vérifier la session côté client
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)

// Résultat attendu:
{
  user: {
    id: "...",
    email: "test@example.com",
    name: "TestUser",
    uplayProfile: "TestPlayer"
  },
  expires: "2025-02-..."
}
```

### 4. Tester la sécurité

**Test 1**: Cookie HTTP-only
```javascript
// Dans la console navigateur
document.cookie
// Ne doit PAS contenir next-auth.session-token
```

**Test 2**: Protection CSRF
```bash
# Essayer une requête sans cookie CSRF (doit échouer)
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"itemType":"operator","itemId":"test"}'
```

**Test 3**: Session expirée
1. Se connecter
2. Modifier manuellement la date d'expiration dans MongoDB
3. Rafraîchir la page

**Résultat attendu**: Redirection vers `/auth`

---

## 📊 Checklist de validation

### Authentification
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Session persiste après refresh
- [ ] Pages protégées redirigent si non connecté
- [ ] Cookie `next-auth.session-token` présent et HTTP-only

### Favoris
- [ ] Ajout de favori (connecté)
- [ ] Suppression de favori (connecté)
- [ ] Toast si non connecté
- [ ] Favoris persistent après refresh
- [ ] Pas de header Authorization dans les requêtes

### UI/UX
- [ ] Navbar affiche le username/email
- [ ] Menu utilisateur fonctionne
- [ ] Redirections correctes
- [ ] Messages d'erreur clairs
- [ ] Formulaires validés

### Tests Cypress
- [ ] `npm run test:open` lance Cypress
- [ ] `npm test` exécute tous les tests
- [ ] Tests `auth.cy.ts` passent (12/12)
- [ ] Tests `navigation.cy.ts` passent (25+/25+)
- [ ] Pas de faux positifs

### Sécurité
- [ ] Pas de token en localStorage
- [ ] Cookies HTTP-only uniquement
- [ ] Protection CSRF active
- [ ] Validation Zod côté serveur
- [ ] Session expire après 30 jours

---

## 🚨 Problèmes courants

### Problème 1: "NEXTAUTH_SECRET is not defined"

**Symptôme**: Erreur au démarrage du serveur

**Solution**:
```bash
# Générer un secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Ajouter à .env.local
echo "NEXTAUTH_SECRET=<votre-secret>" >> .env.local

# Redémarrer le serveur
npm run dev
```

### Problème 2: Tests Cypress échouent avec "baseUrl not found"

**Symptôme**: Erreur "Could not connect to http://localhost:3000"

**Solution**:
```bash
# Vérifier que le serveur dev tourne
lsof -i :3000

# Si pas de processus, lancer:
npm run dev
```

### Problème 3: "user.username is not defined"

**Symptôme**: Erreur TypeScript ou undefined dans l'UI

**Solution**: Utiliser `user.name` au lieu de `user.username`

```typescript
// ❌ INCORRECT
<span>{user.username}</span>

// ✅ CORRECT
<span>{user.name || user.email}</span>
```

### Problème 4: Session non persistante

**Symptôme**: Déconnecté après refresh

**Solutions**:
1. Vérifier `NEXTAUTH_SECRET` est défini
2. Vérifier cookies dans DevTools (pas bloqués)
3. Vérifier `session.maxAge` dans `auth.ts`
4. Vérifier pas d'erreurs dans la console

### Problème 5: Favoris ne se chargent pas

**Symptôme**: Liste vide malgré des favoris en DB

**Solutions**:
1. Vérifier session active (`/api/auth/session`)
2. Vérifier Network tab pour `/api/favorites`
3. Vérifier pas de header Authorization (déprécié)
4. Vérifier MongoDB connecté

---

## 📞 Support

### Commandes de débogage

```bash
# Vérifier l'état de la base de données
mongosh "mongodb+srv://..." --eval "db.users.find()"

# Vérifier les logs Next.js
npm run dev -- --turbo

# Nettoyer le cache
rm -rf .next
npm run build

# Réinstaller Cypress
rm -rf cypress node_modules
npm install
```

### Logs utiles

**Console navigateur**: F12 → Console  
**Network requests**: F12 → Network  
**Cookies**: F12 → Application → Cookies  
**Logs serveur**: Terminal où `npm run dev` tourne

---

## 🎉 Validation finale

Si tous les tests passent:

✅ **Authentification sécurisée** fonctionnelle  
✅ **Favoris** fonctionnels avec NextAuth  
✅ **Tests Cypress** tous verts  
✅ **Sécurité** validée (pas de localStorage)  

**L'application est prête pour la production !** 🚀

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 1.0.0
