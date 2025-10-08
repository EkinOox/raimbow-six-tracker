# R6 Tracker - Rainbow Six Siege Statistics Tracker

Une application web moderne de suivi des statistiques Rainbow Six Siege avec une interface glassmorphisme élégante, des animations fluides et une expérience utilisateur immersive.

## 🎯 Vision du Projet

R6 Tracker est conçu pour permettre aux joueurs de Rainbow Six Siege de suivre et analyser leurs performances avec style. L'application offre une interface moderne avec des effets glassmorphism, des animations Framer Motion et une architecture robuste basée sur Next.js 14+.

## 🚀 Fonctionnalités Principales

### ✨ Interface Utilisateur
- **Design Glassmorphisme** : Interface moderne avec effets de verre et transparence
- **Animations Fluides** : Transitions et animations avec Framer Motion
- **Responsive Design** : Optimisé pour mobile, tablette et desktop
- **Thème R6** : Palette de couleurs inspirée de Rainbow Six Siege

### 🔍 Recherche et Statistiques
- **Recherche Multi-Plateforme** : PC (Uplay), Xbox Live, PlayStation Network, Console
- **Types de Statistiques** :
  - **Général** : Vue d'ensemble des performances globales
  - **Ranked** : Statistiques de partie classée avec rang et MMR
  - **Casual** : Statistiques de partie décontractée
- **Validation Avancée** : Vérification des noms d'utilisateur selon les standards R6
- **Cache Intelligent** : Mise en cache des résultats pour améliorer les performances

### 📊 Visualisation des Données
- **Cartes Statistiques** : Affichage en grille avec design glassmorphism
- **Indicateurs Visuels** : Couleurs et icônes pour identifier rapidement les métriques
- **Navigation par Onglets** : Basculement fluide entre types de statistiques
- **États de Chargement** : Feedback visuel pendant les requêtes API

## 🛠️ Stack Technologique

### Framework & Outils
- **Next.js 14+** : Framework React avec App Router
- **TypeScript** : Type safety et meilleure expérience développeur
- **Tailwind CSS** : Framework CSS utilitaire avec configuration personnalisée
- **Framer Motion** : Bibliothèque d'animations pour React

### Gestion d'État & APIs
- **Zustand** : Store de gestion d'état léger et performant
- **Mock API** : API simulée pour les tests et démonstrations
- **r6s-stats-api** : API Node.js pour récupérer les vraies statistiques R6
- **r6operators** : Collection d'icônes vectorisées des opérateurs

## 📦 APIs et Packages Utilisés

### 1. r6s-stats-api

API principale pour récupérer les statistiques des joueurs Rainbow Six Siege.

#### Installation
```bash
npm install r6s-stats-api
```

#### Utilisation
```javascript
const R6 = require('r6s-stats-api');

// Statistiques générales
async function getGeneralStats() {
    let general = await R6.general('pc', 'nom_joueur');
    console.log('Statistiques générales:', general);
}

// Statistiques ranked
async function getRankedStats() {
    let ranked = await R6.rank('pc', 'nom_joueur');
    console.log('Statistiques ranked:', ranked);
}

// Statistiques casual
async function getCasualStats() {
    let casual = await R6.casual('pc', 'nom_joueur');
    console.log('Statistiques casual:', casual);
}
```

#### Données Disponibles

**Statistiques Générales** :
- K/D ratio, kills, deaths
- Taux de victoire, victoires, défaites
- Niveau, XP total, temps de jeu
- Headshots, kills au corps à corps, kills aveugles

**Statistiques Ranked** :
- Rang actuel et maximum, MMR
- K/D ratio spécifique au ranked
- Statistiques de saison
- Temps de jeu en ranked

**Statistiques Casual** :
- MMR casual, rang casual
- Kills par match et par minute
- Statistiques de performance décontractée

### 2. r6operators

Collection d'icônes vectorisées haute qualité des opérateurs Rainbow Six Siege.

#### Installation
```bash
npm install r6operators
```

#### Utilisation
```javascript
import r6operators from "r6operators";
import { ace, getSVGIcon } from "r6operators";

// Accès aux données d'un opérateur
console.log(r6operators.alibi);
// {
//   id: 'alibi',
//   name: 'Alibi',
//   role: 'Defender',
//   org: 'GIS',
//   squad: 'VIPERSTRIKE',
//   ratings: { health: 1, speed: 3, difficulty: 3 },
//   meta: { gender: 'f', country: 'it', season: 'Y3S2' },
//   bio: { real_name: 'Aria de Luca', birthplace: 'Tripoli, Lybia' }
// }

// Génération d'icône SVG
r6operators.alibi.toSVG({ class: "large", color: "red" });
```

#### Données des Opérateurs
- **Métadonnées** : Nom, rôle, organisation, escouade
- **Statistiques** : Santé, vitesse, difficulté
- **Informations** : Nom réel, lieu de naissance, saison d'ajout
- **Icônes SVG** : Graphiques vectoriels haute qualité

## 🏗️ Architecture du Projet

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Page d'accueil
│   ├── search/page.tsx      # Recherche de joueurs
│   ├── dashboard/page.tsx   # Tableau de bord
│   ├── comparison/page.tsx  # Comparaison de joueurs
│   ├── operators/page.tsx   # Page opérateurs
│   ├── maps/page.tsx        # Page cartes
│   ├── api-test/page.tsx    # Tests API
│   └── layout.tsx           # Layout principal
├── components/
│   ├── Layout/              # Layout avec navigation
│   ├── Navbar/              # Navigation principale
│   ├── PlayerSearch/        # Composant de recherche
│   ├── PlayerCard/          # Carte joueur
│   └── ui/                  # Composants UI réutilisables
├── services/
│   ├── r6MockApi.ts         # API Mock complète
│   └── r6Api.ts             # API réelle (avec r6s-stats-api)
├── stores/
│   └── playerStore.ts       # Store Zustand
├── types/
│   └── r6.ts                # Types TypeScript
└── styles/
    └── globals.css          # Styles globaux avec thème R6
```

## 🎨 Design System

### Palette de Couleurs R6
```css
:root {
  /* Couleurs principales R6 */
  --r6-primary: #ff3d2c;      /* Rouge signature R6 */
  --r6-secondary: #0c0f16;    /* Noir profond */
  --r6-accent: #ffd23f;       /* Jaune accent */
  --r6-dark: #0c0f16;         /* Arrière-plan sombre */
  --r6-dark-secondary: #1a1d26; /* Arrière-plan secondaire */
  --r6-light: #f8f9fa;        /* Texte clair */
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Composants Clés
- **Navbar** : Navigation responsive avec menu mobile
- **PlayerCard** : Affichage des statistiques avec design glassmorphism
- **PlayerSearch** : Formulaire de recherche avec validation
- **Layout** : Structure principale avec animations de page

## 🚀 Installation et Utilisation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone https://github.com/EkinOox/raimbow-six-tracker.git
cd raimbow-six-tracker/r6-tracker

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Dépendances Principales
```json
{
  "dependencies": {
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "framer-motion": "^11.x",
    "zustand": "^4.x",
    "r6s-stats-api": "^1.x",
    "r6operators": "^3.x",
    "primeicons": "^7.x"
  }
}
```

## 🔧 Configuration

### API Mock vs API Réelle
L'application peut fonctionner avec :
1. **API Mock** (par défaut) : Données simulées pour les tests
2. **API Réelle** : Intégration avec `r6s-stats-api` pour les vraies données

### Variables d'Environnement
```env
# Optionnel : Configuration API
NEXT_PUBLIC_API_MODE=mock # ou "real"
NEXT_PUBLIC_API_BASE_URL=https://api.r6stats.com
```

## 🎯 Fonctionnalités à Venir

- [ ] **Dashboard Avancé** : Graphiques et visualisations détaillées
- [ ] **Comparaison de Joueurs** : Analyse comparative entre plusieurs profils
- [ ] **Statistiques par Opérateur** : Performance détaillée par personnage
- [ ] **Analyse par Carte** : Performance sur chaque map
- [ ] **Historique des Performances** : Suivi de l'évolution dans le temps
- [ ] **Mode Équipe** : Statistiques d'équipe et matchmaking

## 📊 Performance et Optimisation

- **Score Lighthouse** : Objectif > 90
- **Accessibilité** : Support WCAG 2.1
- **SEO** : Meta tags optimisés
- **Type Safety** : TypeScript strict mode
- **Code Quality** : ESLint + Prettier
- **Responsive** : Mobile-first design

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md] pour les guidelines.

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE] pour plus de détails.

---

**Note** : Ce projet n'est pas affilié à Ubisoft Entertainment. Tom Clancy's, Rainbow Six, et tous les logos associés sont des marques commerciales d'Ubisoft Entertainment.
