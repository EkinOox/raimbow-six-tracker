# 📋 TODO - Améliorations R6 Tracker

## 🔐 Sécurité & Authentication (PRIORITÉ HAUTE)

### ✅ NextAuth.js - DÉJÀ IMPLÉMENTÉ
- [x] Installation de NextAuth v5 (Auth.js)
- [x] Configuration avec Credentials Provider
- [x] Cookies HTTP-only sécurisés automatiques
- [x] Middleware de protection des routes
- [x] Types TypeScript étendus
- [x] Hook `useAuth()` personnalisé
- [ ] **Migration complète** :
  - [ ] Remplacer `localStorage.getItem('token')` par session NextAuth
  - [ ] Migrer page `/auth` pour utiliser `signIn()` de NextAuth
  - [ ] Migrer Redux `authSlice` vers NextAuth
  - [ ] Mettre à jour Navbar avec `useAuth()`
  - [ ] Mettre à jour page `/profile` avec session
  - [ ] Mettre à jour `/dashboard-new` avec session
  - [ ] Mettre à jour API `/api/favorites` pour récupérer userId depuis session
  - [ ] Supprimer tous les `localStorage` tokens
  - [ ] Tester la connexion/déconnexion

**Fichiers à modifier** :
- `src/app/auth/page.tsx`
- `src/store/slices/authSlice.ts`
- `src/components/Navbar/Navbar.tsx`
- `src/app/profile/page.tsx`
- `src/app/dashboard-new/page.tsx`
- `src/app/api/favorites/route.ts`

---

## 🛡️ Configuration Next.js (PRIORITÉ HAUTE)

### Headers de sécurité
- [x] **Supprimer `X-XSS-Protection`** (deprecated)
  - Fichier: `next.config.ts`
  - Action: Retiré du fichier de config
  - Raison: [MDN - Deprecated](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

- [x] **Corriger `Cross-Origin-Resource-Policy`**
  - Actuel: ~~`cross-origin`~~
  - Changé en: `same-origin` ✅
  - Fichier: `next.config.ts`

### Images
- [x] **Retirer `dangerouslyAllowSVG`**
  - Fichier: `next.config.ts`
  - Action: Supprimé ✅
  - Alternative: Convertir les SVG en composants React si nécessaire

---

## ⚡ Cache & Performance (PRIORITÉ MOYENNE)

### Améliorer la stratégie de cache
- [x] **Créer système de cache unifié** ✅
  - Fichier: `src/lib/cache.ts`
  - Memory cache avec nettoyage automatique
  - TTL configurables (1h, 5min, 24h)
  - Support extensible à Redis

- [ ] **API Routes** - Intégrer le cache
  - `/api/operators` - Cache 1h (données statiques)
  - `/api/weapons` - Cache 1h (données statiques)
  - `/api/maps` - Cache 1h (données statiques)
  - `/api/r6-data-proxy` - Cache 5min (données joueurs)

- [ ] **Utiliser le cache React Query/SWR**
  - Installer `@tanstack/react-query`
  - Remplacer les hooks Redux par React Query
  - Stale-while-revalidate pour meilleure UX

---

## ✅ Validation Zod (PRIORITÉ MOYENNE)

### Extensions d'utilisation
- [x] Schémas auth (login, register, update)
- [x] Schémas R6 API
- [x] Schémas favoris
- [x] **Schémas de filtres créés** ✅
  - `src/schemas/filters.schema.ts`
  - Schémas: searchQuery, operatorFilters, weaponFilters, mapFilters
  - Schémas: playerComparison, operatorComparison
  
- [ ] **Intégrer la validation dans les pages** :
  - [ ] Formulaire de recherche (`src/app/search/page.tsx`)
  - [ ] Filtres opérateurs (`src/app/operators/page.tsx`)
  - [ ] Filtres armes (`src/app/weapons/page.tsx`)
  - [ ] Filtres maps (`src/app/maps/page.tsx`)
  - [ ] API maps (`src/app/api/maps/route.ts`)
  - [ ] API weapons (`src/app/api/weapons/route.ts`)

---

## 🗂️ Structure & Nettoyage (PRIORITÉ MOYENNE)

### Fichiers inutilisés à supprimer
- [x] `src/hooks/useCrossAPIData.ts` ✅ (déjà supprimé)
- [x] `src/hooks/useCrossAPIData 2.ts` ✅ (déjà supprimé)
- [ ] Vérifier autres doublons/fichiers inutilisés

### Zustand non utilisé
- [x] **Zustand supprimé** ✅
  - Package retiré des dépendances
  - Redux Toolkit conservé pour le state management

### Réorganisation
```
src/
├── app/              ✅ Routes Next.js
├── components/       ✅ Composants React
├── lib/              ✅ Utilitaires (auth, mongodb, cache)
├── schemas/          ✅ Validation Zod
├── types/            ✅ Types TypeScript
├── hooks/            ⚠️ À nettoyer
├── store/            ⚠️ Redux ou Zustand ?
├── services/         ⚠️ Fusionner avec lib/?
└── utils/            ⚠️ Fusionner avec lib/?
```

---

## 🌐 SEO & Métadonnées (PRIORITÉ BASSE)

### Sitemap & Robots
- [x] `sitemap.ts` existe
- [x] `robots.txt` existe
- [ ] **Améliorer sitemap** :
  - [ ] Ajouter toutes les routes dynamiques
  - [ ] Ajouter `changefreq` et `priority`
  - [ ] Générer sitemap pour opérateurs
  - [ ] Générer sitemap pour armes
  - [ ] Générer sitemap pour maps

### Balises Meta
- [x] Open Graph (OG) de base
- [x] Twitter Card de base
- [ ] **Améliorer** :
  - [ ] Meta par page (operators, weapons, maps)
  - [ ] Images OG spécifiques par page
  - [ ] JSON-LD Schema.org détaillé
  - [ ] Canonical URLs

---

## 📄 Pages manquantes (PRIORITÉ BASSE)

### Page À Propos
- [x] Créer `src/app/about/page.tsx` ✅
  - Présentation du projet
  - Technologies utilisées
  - Équipe/Contact
  - Stack technique détaillée

### Page Mentions Légales
- [ ] Créer `src/app/legal/page.tsx`
  - CGU
  - Politique de confidentialité
  - RGPD

---

## 🧪 Tests (PRIORITÉ BASSE)

### Framework de test
- [ ] Installer Jest + React Testing Library
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom
  ```

### Tests à implémenter
- [ ] **Tests unitaires** :
  - [ ] Validation Zod schemas
  - [ ] Utilitaires (statsTransformer, weaponCategories)
  - [ ] Hooks (useAuth, useR6Data)

- [ ] **Tests d'intégration** :
  - [ ] API routes (auth, favorites, operators)
  - [ ] Authentification NextAuth
  - [ ] MongoDB connexion

- [ ] **Tests E2E** :
  - [ ] Playwright/Cypress
  - [ ] Flux connexion/inscription
  - [ ] Recherche joueur
  - [ ] Ajout favoris

---

## 📖 Documentation (PRIORITÉ BASSE)

### README.md
- [x] **Mettre à jour** ✅
  - [x] Badges (build, license, version)
  - [x] Stack technique détaillée
  - [x] Installation et configuration
  - [x] Variables d'environnement
  - [x] Scripts disponibles
  - [x] Structure du projet
  - [x] API endpoints
  - [x] Sécurité
  - [x] Performance
  - [x] Roadmap

### Fichiers de configuration
- [x] `.env.example` mis à jour ✅
  - Variables NextAuth
  - MongoDB
  - APIs externes
  - Configuration complète

### Documentation technique
- [x] `docs/API_DOCUMENTATION.md` existe
- [x] `docs/ZOD_VALIDATION.md` créé
- [x] `docs/NEXTAUTH_MIGRATION.md` créé
- [ ] Créer `docs/ARCHITECTURE.md`
- [ ] Créer `docs/DEPLOYMENT.md`

---

## 📊 Suivi des améliorations

### Légende
- ✅ Fait
- 🚧 En cours
- ⏳ À faire
- ❌ Abandonné

### Statistiques
- **Sécurité** : 1/9 (11%)
- **Configuration** : 3/3 (100%) ✅
- **Cache** : 1/4 (25%)
- **Validation Zod** : 7/13 (54%)
- **Structure** : 3/4 (75%)
- **SEO** : 2/12 (17%)
- **Pages** : 1/2 (50%)
- **Tests** : 0/12 (0%)
- **Documentation** : 5/10 (50%)

**TOTAL** : 23/69 (33%)

---

## 🎯 Plan d'action recommandé

### Sprint 1 - Sécurité (1-2 jours)
1. Migrer complètement vers NextAuth
2. Supprimer localStorage
3. Corriger headers sécurité
4. Retirer dangerouslyAllowSVG

### Sprint 2 - Performance (1 jour)
1. Implémenter système de cache unifié
2. Ajouter React Query
3. Optimiser API routes

### Sprint 3 - Qualité du code (1 jour)
1. Étendre validation Zod
2. Nettoyer fichiers inutilisés
3. Décider Redux vs Zustand

### Sprint 4 - SEO & Documentation (1 jour)
1. Améliorer sitemap
2. Ajouter meta tags
3. Mettre à jour README
4. Créer page À Propos

### Sprint 5 - Tests (optionnel)
1. Configuration Jest
2. Tests unitaires critiques
3. Tests d'intégration API

---

## 🔗 Ressources utiles

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Zod Documentation](https://zod.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

---

**Dernière mise à jour** : 3 novembre 2025
