# 🎮 R6 Tracker - Rainbow Six Siege Statistics Tracker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Une application web moderne et performante pour suivre vos statistiques Rainbow Six Siege en temps réel.

[Démo en ligne](#) • [Documentation](./r6-tracker/docs/) • [Contribuer](#-contribution)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Captures d'écran](#-captures-décran)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Documentation](#-documentation)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 À propos

**R6 Tracker** est une application web complète permettant aux joueurs de Rainbow Six Siege de :

- 🔍 **Rechercher** des joueurs sur toutes les plateformes (PC, Xbox, PlayStation)
- 📊 **Analyser** des statistiques détaillées (Ranked, Casual, Overall)
- 👤 **Explorer** les opérateurs, armes et cartes du jeu
- ⭐ **Sauvegarder** leurs favoris (opérateurs, armes, cartes)
- 📈 **Comparer** les performances entre joueurs
- 🗺️ **Visualiser** les call-outs des cartes par étage

L'application offre une **interface moderne** avec des effets glassmorphism, des **animations fluides** avec Framer Motion, et une **architecture robuste** basée sur Next.js 15 avec le nouveau App Router.

---

## � Captures d'écran

<div align="center">

### Page d'accueil
*Interface moderne avec design glassmorphism et animations fluides*

### Recherche de joueurs
*Recherche multi-plateforme avec validation en temps réel*

### Profil joueur
*Statistiques détaillées avec visualisations interactives*

### Galerie d'opérateurs
*Collection complète avec filtres avancés*

</div>

---

## ✨ Fonctionnalités

### 🔐 Authentification & Profils
- Inscription et connexion sécurisées (JWT)
- Gestion de profil utilisateur
- Lien avec compte Uplay
- Système de favoris personnalisés

### 🔍 Recherche & Statistiques
- **Recherche multi-plateforme** : PC (Uplay), Xbox Live, PlayStation Network
- **Statistiques complètes** :
  - 🏆 **Ranked** : Rang, MMR, KD, Win Rate
  - 🎯 **Casual** : Statistiques décontractées
  - 📊 **Overall** : Vue d'ensemble globale
- **Validation intelligente** : Vérification des usernames selon les standards R6
- **Cache optimisé** : Réponses rapides avec cache serveur (30 min)

### � Opérateurs
- **77 opérateurs** avec images haute qualité
- **Filtres avancés** : Side (ATK/DEF), Role, Unit, Speed, Health
- **Tri personnalisable** : Nom, Saison, Stats
- **Vue détaillée** : Biographie, stats, armes, gadgets
- **Système de favoris**

### 🔫 Armes
- **110+ armes** catégorisées
- **Filtres** : Type (AR, SMG, Shotgun, DMR, Sniper), Opérateur
- **Statistiques complètes** : Dégâts, cadence, capacité
- **Images optimisées** avec cache

### 🗺️ Cartes
- **27 cartes officielles** avec images
- **Call-outs par étage** : Basement, 1F, 2F, 3F, Roof
- **Galerie interactive** avec navigation par thumbnails
- **Filtres** : Playlist (Ranked, Quick Match, etc.)
- **Métadonnées** : Date de sortie, localisation, reworks

### 🔄 Comparaison
- **Joueurs** : Comparer 2 joueurs côte à côte
- **Opérateurs** : Comparer stats et capacités
- **Équipes** : Analyser 5v5 (à venir)

---

## �️ Technologies

### Core Stack
- **[Next.js 15.5.4](https://nextjs.org/)** - Framework React avec App Router et Turbopack
- **[React 19.1.0](https://react.dev/)** - Bibliothèque UI avec Server Components
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type safety et DX améliorée
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Framework CSS utilitaire

### State Management & Data Fetching
- **[Redux Toolkit 2.x](https://redux-toolkit.js.org/)** - Gestion d'état globale moderne
- **[Redux Persist 6.x](https://github.com/rt2zz/redux-persist)** - Persistance localStorage
- **Hooks personnalisés** - Abstraction de la logique Redux

### UI & Animations
- **[Framer Motion 11.x](https://www.framer.com/motion/)** - Animations et transitions
- **[PrimeIcons 7.x](https://primereact.org/icons/)** - Bibliothèque d'icônes
- **CSS personnalisé** - Glassmorphism et effets visuels

### Backend & Base de données
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Base de données NoSQL cloud
- **[Mongoose](https://mongoosejs.com/)** - ODM pour MongoDB
- **[JWT](https://jwt.io/)** - Authentification sécurisée
- **API Routes Next.js** - Endpoints serveur

### APIs Externes
- **R6 Data API** - Statistiques des joueurs Rainbow Six Siege
- **R6 Stats API** - Données supplémentaires et opérateurs

### Development Tools
- **[ESLint](https://eslint.org/)** - Linting JavaScript/TypeScript
- **[Turbopack](https://turbo.build/)** - Bundler ultra-rapide
- **Git** - Contrôle de version

---

## 🚀 Installation

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 18.0 ou supérieur ([Télécharger](https://nodejs.org/))
- **npm** 9.0 ou supérieur (inclus avec Node.js)
- **Git** ([Télécharger](https://git-scm.com/))
- **Compte MongoDB Atlas** ([Créer un compte gratuit](https://www.mongodb.com/cloud/atlas/register))

### Installation du projet

1. **Cloner le repository**

```bash
git clone https://github.com/EkinOox/raimbow-six-tracker.git
cd raimbow-six-tracker/r6-tracker
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine du projet `r6-tracker/` :

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/r6tracker?retryWrites=true&w=majority

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_ultra_securise_minimum_32_caracteres

# URLs de l'application (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# APIs Externes
R6_API_BASE_URL=https://r6-api.vercel.app
API_TIMEOUT=10000
USER_AGENT=R6-Tracker-App/1.0

# Cache (optionnel)
CACHE_DURATION=1800000  # 30 minutes en millisecondes

# Google Analytics (optionnel, production uniquement)
NEXT_PUBLIC_GOOGLE_VERIFICATION=votre_code_google_verification
```

4. **Générer une clé JWT sécurisée** (optionnel)

```bash
# Sur macOS/Linux
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

5. **Configurer MongoDB Atlas**

- Créez un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Créez une base de données nommée `r6tracker`
- Autorisez votre adresse IP dans "Network Access"
- Créez un utilisateur de base de données
- Copiez la connection string dans `MONGODB_URI`

---

## 🎮 Utilisation

### Lancer en mode développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

### Compiler pour la production

```bash
npm run build
```

### Lancer en mode production

```bash
npm start
```

### Autres commandes utiles

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Linter le code
npm run lint

# Formater le code
npm run format

# Nettoyer le cache Next.js
rm -rf .next
```

---

## ⚙️ Configuration

### Variables d'environnement

### Variables d'environnement

| Variable | Description | Requis | Valeur par défaut |
|----------|-------------|--------|-------------------|
| `MONGODB_URI` | Connection string MongoDB Atlas | ✅ Oui | - |
| `JWT_SECRET` | Clé secrète JWT (min 32 caractères) | ✅ Oui | - |
| `NEXT_PUBLIC_SITE_URL` | URL du site (pour SEO) | ❌ Non | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL de l'API | ❌ Non | `http://localhost:3000` |
| `R6_API_BASE_URL` | URL de l'API R6 externe | ❌ Non | `https://r6-api.vercel.app` |
| `API_TIMEOUT` | Timeout des requêtes API (ms) | ❌ Non | `10000` |
| `CACHE_DURATION` | Durée du cache serveur (ms) | ❌ Non | `1800000` (30 min) |

### Ports utilisés

- **3000** : Application Next.js (développement et production)
- **27017** : MongoDB (si utilisé localement)

---

## 📁 Structure du projet

```
raimbow-six-tracker/
├── r6-tracker/                      # Application principale
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── page.tsx            # 🏠 Page d'accueil
│   │   │   ├── layout.tsx          # Layout principal avec metadata
│   │   │   ├── globals.css         # Styles globaux + thème R6
│   │   │   ├── auth/               # 🔐 Authentification
│   │   │   │   └── page.tsx
│   │   │   ├── search/             # 🔍 Recherche de joueurs
│   │   │   │   └── page.tsx
│   │   │   ├── profile/            # 👤 Profil joueur
│   │   │   │   └── [username]/page.tsx
│   │   │   ├── operators/          # 👥 Opérateurs
│   │   │   │   ├── page.tsx
│   │   │   │   └── [safename]/page.tsx
│   │   │   ├── weapons/            # 🔫 Armes
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── maps/               # 🗺️ Cartes
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── comparaison/        # 🔄 Comparaison
│   │   │   │   └── page.tsx
│   │   │   └── api/                # 🔌 API Routes
│   │   │       ├── auth/           # Authentification
│   │   │       ├── operators/      # CRUD opérateurs
│   │   │       ├── weapons/        # CRUD armes
│   │   │       ├── maps/           # CRUD cartes
│   │   │       ├── favorites/      # Gestion favoris
│   │   │       └── r6-data-proxy/  # Proxy API R6
│   │   ├── components/             # Composants React
│   │   │   ├── Layout/            # Layout wrapper
│   │   │   ├── Navbar/            # Navigation
│   │   │   ├── PlayerSearch.tsx   # Recherche joueur
│   │   │   ├── PlayerComparison.tsx
│   │   │   ├── OperatorImage.tsx  # Image opérateur avec fallback
│   │   │   ├── MapGallery.tsx     # Galerie cartes
│   │   │   ├── FavoriteButtonOptimized.tsx
│   │   │   └── ui/                # Composants UI réutilisables
│   │   │       ├── LoadingState.tsx
│   │   │       ├── ErrorState.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── SectionHeader.tsx
│   │   ├── store/                  # Redux Store
│   │   │   ├── index.ts           # Configuration store
│   │   │   ├── ReduxProvider.tsx  # Provider React
│   │   │   └── slices/
│   │   │       ├── authSlice.ts   # 🔐 Authentification
│   │   │       ├── operatorsSlice.ts # 👥 Opérateurs
│   │   │       ├── weaponsSlice.ts   # 🔫 Armes
│   │   │       ├── mapsSlice.ts      # 🗺️ Cartes
│   │   │       └── favoritesSlice.ts # ⭐ Favoris
│   │   ├── hooks/                  # Hooks personnalisés
│   │   │   └── useR6Data.ts       # Hooks Redux abstraction
│   │   ├── lib/                    # Utilitaires
│   │   │   ├── mongodb.ts         # Connexion MongoDB
│   │   │   ├── jwt.ts             # Gestion JWT
│   │   │   ├── mapImages.ts       # Gestion images cartes
│   │   │   ├── floorLabels.ts     # Labels étages
│   │   │   └── imageConfig.ts     # Config cache images
│   │   ├── models/                 # Modèles MongoDB
│   │   │   ├── User.ts            # Modèle utilisateur
│   │   │   └── Favorite.ts        # Modèle favori
│   │   ├── types/                  # Types TypeScript
│   │   │   ├── r6-api-types.ts    # Types API
│   │   │   └── r6-data-types.ts   # Types données
│   │   ├── styles/                 # Styles partagés
│   │   │   └── shared-styles.ts   # Constantes CSS
│   │   └── utils/                  # Utilitaires
│   │       ├── statsTransformer.ts
│   │       ├── weaponCategories.ts
│   │       └── weaponImages.ts
│   ├── public/                     # Assets statiques
│   │   ├── images/
│   │   │   ├── logo/              # Logos R6
│   │   │   ├── maps/              # Images de cartes
│   │   │   │   └── calls/         # Call-outs par carte
│   │   │   ├── ranks/             # Icônes de rang
│   │   │   └── weapons/           # Images d'armes
│   │   ├── manifest.json          # PWA manifest
│   │   └── robots.txt
│   ├── docs/                       # 📚 Documentation
│   │   ├── REDUX_DOCUMENTATION.md
│   │   ├── API_DOCUMENTATION.md
│   │   ├── INSTALLATION.md
│   │   └── DEPLOYMENT.md
│   ├── .env.local                  # Variables d'environnement (local)
│   ├── .env.example                # Template .env
│   ├── next.config.ts              # Configuration Next.js
│   ├── tailwind.config.ts          # Configuration Tailwind
│   ├── tsconfig.json               # Configuration TypeScript
│   └── package.json                # Dépendances npm
└── README.md                       # Ce fichier
```

---

## 📚 Documentation

Documentation complète disponible dans le dossier [`docs/`](./r6-tracker/docs/) :

- **[Redux Documentation](./r6-tracker/docs/REDUX_DOCUMENTATION.md)** - Guide complet de la gestion d'état
- **[API Documentation](./r6-tracker/docs/API_DOCUMENTATION.md)** - Documentation des endpoints API
- **[Installation Guide](./r6-tracker/docs/INSTALLATION.md)** - Guide d'installation détaillé
- **[Deployment Guide](./r6-tracker/docs/DEPLOYMENT.md)** - Déploiement en production

### Guides rapides

- [Comment ajouter un nouvel opérateur ?](./r6-tracker/docs/API_DOCUMENTATION.md#ajouter-un-opérateur)
- [Comment configurer MongoDB ?](./r6-tracker/docs/INSTALLATION.md#mongodb-atlas)
- [Comment déployer sur Vercel ?](./r6-tracker/docs/DEPLOYMENT.md#vercel)
- [Comment utiliser Redux ?](./r6-tracker/docs/REDUX_DOCUMENTATION.md#exemples-pratiques)

---

## 🎨 Design & UI

### Palette de couleurs

```css
:root {
  /* Couleurs principales R6 */
  --r6-primary: #ff3d2c;        /* Rouge signature */
  --r6-secondary: #0c0f16;      /* Noir profond */
  --r6-accent: #ffd23f;         /* Jaune accent */
  --r6-dark: #0c0f16;
  --r6-light: #f8f9fa;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
}
```

### Composants UI

- **Glassmorphism** : Effets de verre moderne
- **Animations** : Framer Motion pour transitions fluides
- **Responsive** : Mobile-first design
- **Dark Mode** : Thème sombre par défaut
- **Accessibility** : Support WCAG 2.1

---

## 🚀 Roadmap

### Version 1.1 (En cours)
- [ ] Dashboard utilisateur personnalisé
- [ ] Historique des recherches
- [ ] Notifications en temps réel
- [ ] Mode hors ligne (PWA)

### Version 1.2 (Planifié)
- [ ] Statistiques par opérateur
- [ ] Graphiques de progression
- [ ] Comparaison d'équipe (5v5)
- [ ] Export de statistiques (PDF/CSV)

### Version 2.0 (Futur)
- [ ] Application mobile (React Native)
- [ ] API publique
- [ ] Système de classement
- [ ] Tournois et événements

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### 1. Fork le projet

```bash
# Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/raimbow-six-tracker.git
cd raimbow-six-tracker/r6-tracker
```

### 2. Créer une branche

```bash
git checkout -b feature/amazing-feature
```

### 3. Commit vos changements

```bash
git commit -m "✨ Add amazing feature"
```

### 4. Push vers la branche

```bash
git push origin feature/amazing-feature
```

### 5. Ouvrir une Pull Request

### Guidelines

- 📝 Suivre les conventions de code TypeScript
- ✅ Ajouter des tests si possible
- 📚 Documenter les nouvelles fonctionnalités
- 🎨 Respecter le design system existant
- 🔍 Vérifier les erreurs ESLint avant de commit

### Commit Conventions

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, pas de changement de code
- `refactor:` Refactoring
- `test:` Ajout de tests
- `chore:` Maintenance

---

## 📊 Performances

### Optimisations implémentées

- ✅ **Image Optimization** : Next.js Image avec formats AVIF/WebP
- ✅ **Code Splitting** : Chargement lazy des composants
- ✅ **Cache Strategy** : 
  - Cache API serveur : 30 minutes
  - Cache images : 24 heures
  - Redux Persist pour imageCache
- ✅ **Bundle Size** : 203KB shared JS
- ✅ **SSR/SSG** : Pages statiques quand possible
- ✅ **Turbopack** : Bundler ultra-rapide en dev

### Métriques Lighthouse

| Métrique | Score cible | Score actuel |
|----------|-------------|--------------|
| Performance | 90+ | 🎯 À mesurer |
| Accessibility | 90+ | 🎯 À mesurer |
| Best Practices | 90+ | 🎯 À mesurer |
| SEO | 100 | 🎯 À mesurer |

---

## 🐛 Bugs connus

- Aucun bug critique connu actuellement
- Voir [Issues](https://github.com/EkinOox/raimbow-six-tracker/issues) pour les bugs mineurs

---

## 📝 Changelog

### v1.0.0 (2025-11-03)

#### ✨ Ajouts
- Interface complète avec glassmorphism
- Authentification JWT
- 77 opérateurs, 110+ armes, 27 cartes
- Système de favoris
- Redux Toolkit pour la gestion d'état
- Cache optimisé (API + images)
- Recherche multi-plateforme
- Profils joueurs détaillés
- Comparaison de joueurs

#### 🐛 Corrections
- Fix port configuration (3000)
- Fix CSP pour scripts inline
- Fix Redux logging en production

#### ♻️ Refactoring
- Suppression de ~1500 lignes de code inutilisé
- Création de composants UI réutilisables
- Centralisation des styles
- Optimisation Redux slices

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2025 EkinOox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Auteurs

- **EkinOox** - *Développeur principal* - [@EkinOox](https://github.com/EkinOox)

---

## 🙏 Remerciements

- [Ubisoft](https://www.ubisoft.com/) pour Rainbow Six Siege
- [R6 API](https://r6-api.vercel.app/) pour les données
- [Vercel](https://vercel.com/) pour l'hébergement
- [MongoDB Atlas](https://www.mongodb.com/atlas) pour la base de données
- La communauté R6 pour le support

---

## ⚠️ Disclaimer

Ce projet n'est **pas affilié** à Ubisoft Entertainment. 

**Tom Clancy's**, **Rainbow Six**, **Siege** et tous les logos associés sont des **marques commerciales** d'Ubisoft Entertainment.

Ce projet est développé à des fins éducatives et de démonstration uniquement.

---

<div align="center">

**Fait avec ❤️ par EkinOox**

[⬆ Retour en haut](#-r6-tracker---rainbow-six-siege-statistics-tracker)

</div>
