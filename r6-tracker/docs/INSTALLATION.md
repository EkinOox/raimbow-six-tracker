# 📥 Guide d'Installation - R6 Tracker

Ce guide détaillé vous accompagnera pas à pas dans l'installation et la configuration de R6 Tracker sur votre machine locale.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation de Node.js](#installation-de-nodejs)
- [Installation de MongoDB Atlas](#installation-de-mongodb-atlas)
- [Configuration du projet](#configuration-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [Premier lancement](#premier-lancement)
- [Résolution de problèmes](#résolution-de-problèmes)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

### Logiciels requis

| Logiciel | Version minimum | Recommandé | Lien |
|----------|-----------------|------------|------|
| **Node.js** | 18.0.0 | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0 | 10.x | Inclus avec Node.js |
| **Git** | 2.30.0 | Dernière | [git-scm.com](https://git-scm.com/) |

### Comptes en ligne

- **Compte MongoDB Atlas** (gratuit) : [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
- **Compte GitHub** (optionnel pour contribuer) : [github.com/join](https://github.com/join)

---

## 🟢 Installation de Node.js

### Windows

1. Télécharger le MSI depuis [nodejs.org](https://nodejs.org/)
2. Exécuter l'installateur
3. Cocher "Automatically install necessary tools"
4. Redémarrer le terminal

**Vérification :**
```powershell
node --version  # v20.x.x
npm --version   # 10.x.x
```

### macOS

**Option 1 : Via Homebrew (recommandé)**
```bash
# Installer Homebrew si nécessaire
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Node.js
brew install node@20
```

**Option 2 : Via le package officiel**
1. Télécharger le PKG depuis [nodejs.org](https://nodejs.org/)
2. Suivre l'installation

**Vérification :**
```bash
node --version
npm --version
```

### Linux (Ubuntu/Debian)

```bash
# Via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier
node --version
npm --version
```

---

## 🍃 Installation de MongoDB Atlas

### 1. Créer un compte

1. Aller sur [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. S'inscrire (email + mot de passe ou Google/GitHub)
3. Sélectionner l'offre **M0 Sandbox** (gratuit, 512MB)

### 2. Créer un cluster

1. **Choisir un fournisseur** : AWS, Google Cloud ou Azure
2. **Sélectionner une région** : La plus proche de vous (ex: Europe - Paris)
3. **Nommer le cluster** : `r6tracker-cluster` (ou autre)
4. Cliquer sur **"Create Cluster"** (prend 3-5 minutes)

### 3. Configurer la sécurité

#### A. Créer un utilisateur de base de données

1. Dans le panneau de gauche : **Database Access**
2. Cliquer sur **"Add New Database User"**
3. Remplir :
   - **Username** : `r6tracker_admin`
   - **Password** : Générer un mot de passe fort (noter quelque part !)
   - **Database User Privileges** : `Atlas admin`
4. Cliquer sur **"Add User"**

#### B. Autoriser les connexions réseau

1. Dans le panneau de gauche : **Network Access**
2. Cliquer sur **"Add IP Address"**
3. **Option 1 (développement)** : 
   - Cliquer sur **"Allow Access from Anywhere"**
   - IP : `0.0.0.0/0`
4. **Option 2 (production)** :
   - Entrer votre IP publique
5. Cliquer sur **"Confirm"**

⚠️ **Sécurité** : En production, restreignez l'accès aux IP de vos serveurs uniquement !

### 4. Récupérer la connection string

1. Cliquer sur **"Connect"** sur votre cluster
2. Choisir **"Connect your application"**
3. **Driver** : Node.js
4. **Version** : 5.5 or later
5. Copier la connection string :

```
mongodb+srv://r6tracker_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Remplacer `<password>` par votre vrai mot de passe
7. Ajouter le nom de la base de données après `.net/` :

```
mongodb+srv://r6tracker_admin:MON_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/r6tracker?retryWrites=true&w=majority
```

---

## 📦 Configuration du projet

### 1. Cloner le repository

```bash
# Via HTTPS
git clone https://github.com/EkinOox/raimbow-six-tracker.git

# Ou via SSH (si configuré)
git clone git@github.com:EkinOox/raimbow-six-tracker.git

# Entrer dans le dossier
cd raimbow-six-tracker/r6-tracker
```

### 2. Installer les dépendances

```bash
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json` :
- Next.js 15.5.4
- React 19.1.0
- Redux Toolkit
- Framer Motion
- Et ~30 autres packages

**Temps estimé** : 2-5 minutes selon votre connexion

### 3. Créer le fichier .env.local

```bash
# Copier le template
cp .env.example .env.local

# Ou créer manuellement
touch .env.local
```

---

## 🔐 Variables d'environnement

Ouvrir `.env.local` avec votre éditeur préféré et remplir :

```env
# ============================================
# MongoDB - BASE DE DONNÉES
# ============================================
MONGODB_URI=mongodb+srv://r6tracker_admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/r6tracker?retryWrites=true&w=majority

# ============================================
# JWT - AUTHENTIFICATION
# ============================================
# Générer une clé aléatoire sécurisée (minimum 32 caractères)
JWT_SECRET=votre_cle_secrete_ultra_securisee_minimum_32_caracteres_aleatoires

# ============================================
# URLS DE L'APPLICATION
# ============================================
# URL du site (pour SEO, OpenGraph, sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# URL de l'API (pour les appels internes)
NEXT_PUBLIC_API_URL=http://localhost:3000

# ============================================
# API EXTERNE R6
# ============================================
# URL de l'API Rainbow Six externe
R6_API_BASE_URL=https://r6-api.vercel.app

# Timeout des requêtes API (millisecondes)
API_TIMEOUT=10000

# User Agent pour les requêtes
USER_AGENT=R6-Tracker-App/1.0

# ============================================
# CACHE
# ============================================
# Durée du cache serveur en millisecondes
# 1800000 ms = 30 minutes
CACHE_DURATION=1800000

# ============================================
# GOOGLE (Optionnel - Production uniquement)
# ============================================
# Code de vérification Google Search Console
# NEXT_PUBLIC_GOOGLE_VERIFICATION=votre_code_verification
```

### Générer une clé JWT sécurisée

**Sur macOS/Linux :**
```bash
openssl rand -base64 32
```

**Sur Windows (PowerShell) :**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Résultat exemple :**
```
dK8vN2pQ7xR5mL9cW4sH6fJ3aE1bT8yU0iO
```

### Configuration MongoDB détaillée

**Format de la connection string :**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.REGION.mongodb.net/DATABASE?OPTIONS
```

**Composants :**
- `USERNAME` : Nom d'utilisateur créé dans Database Access
- `PASSWORD` : Mot de passe (URL-encodé si caractères spéciaux)
- `CLUSTER` : Nom de votre cluster (ex: cluster0)
- `REGION` : Région AWS (ex: abc12)
- `DATABASE` : Nom de la base de données (`r6tracker`)
- `OPTIONS` : Paramètres de connexion

**⚠️ Caractères spéciaux dans le mot de passe ?**

Si votre mot de passe contient `@`, `%`, `:`, etc., il faut l'encoder :

```bash
# Exemple de password: Pass@2024!
# Encodé: Pass%402024%21
```

Outil en ligne : [urlencoder.org](https://www.urlencoder.org/)

---

## 🚀 Premier lancement

### 1. Vérifier la configuration

```bash
# Vérifier que .env.local existe et est complet
cat .env.local

# Vérifier l'installation des dépendances
npm list --depth=0
```

### 2. Tester la connexion MongoDB

Créer un fichier `test-db.js` à la racine :

```javascript
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  });
```

Exécuter :
```bash
node test-db.js
```

### 3. Lancer en mode développement

```bash
npm run dev
```

Vous devriez voir :
```
   ▲ Next.js 15.5.4 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000

 ✓ Starting...
 ✓ Ready in 1166ms
```

### 4. Ouvrir dans le navigateur

Ouvrir **http://localhost:3000**

Vous devriez voir la page d'accueil avec :
- ✅ Navbar fonctionnelle
- ✅ Animations Framer Motion
- ✅ Design glassmorphism
- ✅ Video YouTube (si connexion Internet)

### 5. Tester l'authentification

1. Aller sur **http://localhost:3000/auth**
2. Créer un compte de test
3. Se connecter
4. Vérifier que le profil s'affiche dans la navbar

---

## 🐛 Résolution de problèmes

### Erreur : "Cannot connect to MongoDB"

**Causes possibles :**

1. **Connection string incorrecte**
   ```bash
   # Vérifier votre .env.local
   cat .env.local | grep MONGODB_URI
   ```

2. **Mot de passe incorrect**
   - Vérifier que le mot de passe est correct
   - Vérifier l'encoding des caractères spéciaux

3. **IP non autorisée**
   - Aller dans MongoDB Atlas → Network Access
   - Vérifier que votre IP est autorisée
   - En dev : autoriser `0.0.0.0/0` (toutes les IPs)

4. **Cluster non démarré**
   - Attendre que le cluster soit prêt (indicateur vert)
   - Peut prendre 3-5 minutes après création

### Erreur : "JWT_SECRET is not defined"

```bash
# Vérifier que JWT_SECRET existe dans .env.local
grep JWT_SECRET .env.local

# Si absent, ajouter une clé
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local
```

### Erreur : "Port 3000 already in use"

**Cause** : Un autre processus utilise le port 3000

**Solution 1 : Tuer le processus**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Solution 2 : Utiliser un autre port**
```bash
PORT=3001 npm run dev
```

### Erreur : "Module not found"

```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "ESLint errors"

```bash
# Exécuter le linter et corriger automatiquement
npm run lint -- --fix
```

### Page blanche ou erreur 500

1. **Vérifier les logs du terminal**
2. **Vérifier la console navigateur** (F12)
3. **Nettoyer le cache Next.js**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Problème de styles CSS

```bash
# Régénérer les styles Tailwind
npm run build
npm run dev
```

---

## 🔍 Commandes utiles

### Développement

```bash
# Lancer en dev avec Turbopack
npm run dev

# Lancer en dev sur un port différent
PORT=3001 npm run dev

# Lancer en dev avec logs détaillés
DEBUG=* npm run dev
```

### Build & Production

```bash
# Build pour production
npm run build

# Analyser le bundle
npm run build -- --analyze

# Lancer en production
npm start
```

### Maintenance

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les dépendances obsolètes
npm outdated

# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Tests

```bash
# Vérifier les types TypeScript
npm run type-check

# Linter le code
npm run lint

# Formater le code
npm run format
```

---

## 📚 Prochaines étapes

Maintenant que l'installation est terminée :

1. 📖 Lire la [Documentation API](./API_DOCUMENTATION.md)
2. 🔄 Comprendre [Redux](./REDUX_DOCUMENTATION.md)
3. 🚀 Voir le guide de [Déploiement](./DEPLOYMENT.md)
4. 💻 Commencer à développer !

---

## 🆘 Besoin d'aide ?

- 📧 **Email** : support@r6tracker.com
- 💬 **Discord** : [Rejoindre le serveur](https://discord.gg/r6tracker)
- 🐛 **Issues GitHub** : [Ouvrir une issue](https://github.com/EkinOox/raimbow-six-tracker/issues)
- 📚 **Documentation** : [docs/](./README.md)

---

**Dernière mise à jour** : 3 novembre 2025
