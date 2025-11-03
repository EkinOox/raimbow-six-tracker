# 🎮 Rainbow Six Siege Tracker

> Application web moderne pour tracker vos statistiques Rainbow Six Siege, comparer des opérateurs, armes et cartes.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v5-purple)](https://next-auth.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Scripts disponibles](#-scripts-disponibles)
- [Structure du projet](#-structure-du-projet)
- [API](#-api)
- [Sécurité](#-sécurité)
- [Performance](#-performance)
- [Contribution](#-contribution)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Fonctionnalités

### 🔍 Recherche & Statistiques
- **Recherche de joueurs** par nom d'utilisateur et plateforme (PC/PSN/Xbox)
- **Statistiques détaillées** : K/D, W/L, temps de jeu, headshots, etc.
- **Historique des performances** par saison
- **Comparaison de joueurs** (jusqu'à 4 joueurs simultanés)

### 🎯 Opérateurs
- **Liste complète** des opérateurs Rainbow Six Siege
- **Filtres avancés** : côté (ATK/DEF), rôle, équipe, difficulté, vitesse
- **Comparaison d'opérateurs** : statistiques, équipements, gadgets
- **Images optimisées** avec lazy loading

### 🔫 Armes
- **Catalogue complet** des armes du jeu
- **Statistiques détaillées** : dégâts, cadence de tir, mobilité, capacité
- **Filtres** : type d'arme, côté, opérateur
- **Comparaison d'armes** avec graphiques

### 🗺️ Cartes
- **Toutes les cartes** du jeu avec images HD
- **Callouts** et emplacements stratégiques
- **Filtres** par playlist (Ranked, Unranked, Quick Match)
- **Galerie d'images** optimisées (AVIF/WebP)

### 👤 Profil Utilisateur
- **Authentification sécurisée** avec NextAuth.js
- **Favoris** : sauvegardez vos joueurs préférés
- **Profil Uplay** lié pour statistiques personnalisées
- **Historique de recherche**

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : [Next.js 15.5.4](https://nextjs.org/) (App Router)
- **Langage** : TypeScript 5.x
- **Styling** : Tailwind CSS 3.4
- **State Management** : Redux Toolkit
- **Validation** : Zod 4.1.12
- **Icons** : Lucide React
- **Animations** : Framer Motion

### Backend
- **Runtime** : Node.js avec Turbopack
- **Database** : MongoDB Atlas avec Mongoose ODM
- **Authentication** : NextAuth.js v5 (beta)
- **Cache** : Memory cache personnalisé (extensible à Redis)
- **Image Optimization** : Sharp 0.34.4

### Sécurité
- **Cookies HTTP-only** pour les sessions
- **CSP Headers** configurés
- **Validation Zod** sur toutes les entrées
- **Protection CSRF** intégrée à NextAuth
- **Rate limiting** (à implémenter)

### APIs Externes
- [R6 Data API](https://r6data.eu/) - Statistiques joueurs
- [R6 API Vercel](https://r6-api.vercel.app/) - Données opérateurs/armes/cartes

---

## 📦 Installation

### Prérequis
- Node.js 18.x ou supérieur
- npm/yarn/pnpm
- Compte MongoDB Atlas
- Clé API R6 Data (optionnel)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/EkinOox/raimbow-six-tracker.git
cd raimbow-six-tracker/r6-tracker

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer les variables d'environnement (voir section Configuration)

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## ⚙️ Configuration

Créez un fichier `.env.local` à la racine du projet `r6-tracker/` :

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/r6tracker?retryWrites=true&w=majority

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# R6 Data API (optionnel)
R6_DATA_API_KEY=your-api-key-here

# Node Environment
NODE_ENV=development
```

### Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Configuration MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster
3. Créer un utilisateur de base de données
4. Whitelist votre IP (ou 0.0.0.0/0 pour développement)
5. Récupérer la connection string

---

## 🚀 Scripts disponibles

```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build

# Lancer en production
npm run start

# Linter
npm run lint

# Générer le manifest des cartes
npm run generate:maps
```

---

## 📁 Structure du projet

```
r6-tracker/
├── public/                    # Ressources statiques
│   ├── images/
│   │   ├── maps/             # Images des cartes (29 cartes)
│   │   ├── ranks/            # Images des rangs
│   │   └── weapons/          # Images des armes
│   ├── manifest.json         # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── app/                   # Routes Next.js (App Router)
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── favorites/    # Gestion des favoris
│   │   │   ├── operators/    # Données opérateurs
│   │   │   ├── weapons/      # Données armes
│   │   │   └── maps/         # Données cartes
│   │   ├── operators/        # Page opérateurs
│   │   ├── weapons/          # Page armes
│   │   ├── maps/             # Page cartes
│   │   ├── profile/          # Profil utilisateur
│   │   └── search/           # Recherche joueurs
│   │
│   ├── components/            # Composants React
│   │   ├── Navbar/
│   │   ├── Layout/
│   │   ├── ui/               # Composants UI génériques
│   │   └── ...
│   │
│   ├── lib/                   # Librairies & utilitaires
│   │   ├── auth.ts           # Configuration NextAuth
│   │   ├── mongodb.ts        # Connexion MongoDB
│   │   ├── cache.ts          # Système de cache
│   │   └── jwt.ts
│   │
│   ├── models/                # Modèles Mongoose
│   │   ├── User.ts
│   │   └── Favorite.ts
│   │
│   ├── schemas/               # Schémas de validation Zod
│   │   ├── auth.schema.ts
│   │   ├── filters.schema.ts
│   │   └── favorites.schema.ts
│   │
│   ├── store/                 # Redux store
│   │   ├── slices/
│   │   └── index.ts
│   │
│   ├── types/                 # Types TypeScript
│   │   ├── r6-api-types.ts
│   │   └── next-auth.d.ts
│   │
│   └── hooks/                 # Custom hooks
│       ├── useAuth.ts
│       └── useR6Data.ts
│
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── NEXTAUTH_MIGRATION.md
│   └── ZOD_VALIDATION.md
│
├── scripts/
│   └── generate-map-manifest.js
│
├── next.config.ts            # Configuration Next.js
├── tailwind.config.ts        # Configuration Tailwind
├── tsconfig.json             # Configuration TypeScript
└── TODO.md                   # Liste des améliorations
```

---

## 🔌 API

### Endpoints disponibles

#### Authentication
```
POST /api/auth/signin      # Connexion
POST /api/auth/signout     # Déconnexion
GET  /api/auth/session     # Session actuelle
```

#### Favoris
```
GET    /api/favorites      # Liste des favoris
POST   /api/favorites      # Ajouter un favori
DELETE /api/favorites      # Supprimer un favori
```

#### Données R6
```
GET /api/operators         # Liste des opérateurs
GET /api/weapons           # Liste des armes
GET /api/maps              # Liste des cartes
GET /api/r6-data-proxy     # Proxy vers R6 Data API
```

### Exemples d'utilisation

```typescript
// Rechercher un joueur
const response = await fetch('/api/r6-data-proxy?username=Player&platform=uplay');
const data = await response.json();

// Ajouter un favori
const response = await fetch('/api/favorites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'Player',
    platform: 'uplay',
    type: 'player'
  })
});
```

---

## 🔐 Sécurité

### Headers de sécurité configurés
- ✅ Content Security Policy (CSP)
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-Frame-Options (SAMEORIGIN)
- ✅ X-Content-Type-Options (nosniff)
- ✅ Referrer-Policy (strict-origin-when-cross-origin)
- ✅ Cross-Origin-Opener-Policy (same-origin)
- ✅ Cross-Origin-Resource-Policy (same-origin)
- ✅ Permissions-Policy

### Authentification
- Cookies **HTTP-only** et **Secure** (production)
- Sessions JWT avec expiration de 30 jours
- Hachage bcrypt pour les mots de passe
- Protection CSRF intégrée

### Validation
- **Zod** sur toutes les entrées utilisateur
- Sanitization des données
- Type-safety avec TypeScript

---

## ⚡ Performance

### Optimisations Images
- Format **AVIF** et **WebP** automatiques
- Lazy loading natif
- Sizes responsive : 640px → 3840px
- Cache immutable 1 an

### Cache
- Système de cache mémoire centralisé
- TTL configurables :
  - Données statiques : 1h
  - Stats joueurs : 5min
  - Données très statiques : 24h

### Build
- **Turbopack** pour builds ultra-rapides
- Tree-shaking automatique
- Code splitting par route
- Minification et compression gzip

### Statistiques
- **26 routes** compilées
- **Middleware** : 300KB
- **Images optimisées** : ~256MB économisés
- **Lighthouse Score** : 95+ (à mesurer)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Guidelines
- Respecter la structure existante
- Ajouter des tests (si applicable)
- Mettre à jour la documentation
- Suivre les conventions TypeScript/React

---

## 🗺️ Roadmap

Voir [TODO.md](TODO.md) pour la liste complète des améliorations prévues.

### Priorités
- [x] NextAuth.js implémenté
- [x] Système de cache unifié
- [x] Validation Zod étendue
- [ ] Migration complète vers NextAuth
- [ ] Tests unitaires & E2E
- [ ] Page À Propos
- [ ] Sitemap dynamique
- [ ] React Query / SWR

---

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](../LICENSE) pour plus d'informations.

---

## 🙏 Remerciements

- [Ubisoft](https://www.ubisoft.com/) pour Rainbow Six Siege
- [R6 Data](https://r6data.eu/) pour l'API de statistiques
- Communauté Next.js et React

---

## 📧 Contact

**Auteur** : EkinOox  
**GitHub** : [@EkinOox](https://github.com/EkinOox)  
**Repository** : [raimbow-six-tracker](https://github.com/EkinOox/raimbow-six-tracker)

---

<div align="center">
  <p>Fait avec ❤️ pour la communauté Rainbow Six Siege</p>
  <p>⭐ N'oubliez pas de star le projet si vous l'aimez !</p>
</div>

