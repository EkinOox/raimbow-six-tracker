# Tests Rainbow Six Tracker

Ce dossier contient plusieurs scripts de test pour vérifier le bon fonctionnement de l'intégration avec `r6-data.js`.

## Scripts de test disponibles

### 1. Test complet r6-data.js (`test-r6-data.js`)

Test complet de toutes les fonctionnalités de la bibliothèque r6-data.js :

```bash
# Lancement du test complet
npm run test:r6

# Ou directement
node test-r6-data.js
```

**Ce que ce test fait :**
- Teste l'état du service R6
- Teste `getAccountInfo()` avec plusieurs joueurs
- Teste `getPlayerStats()` avec différents filtres
- Teste les APIs auxiliaires (maps, operators, weapons)
- Affiche la structure complète des données retournées

### 2. Test rapide (`quick-test.js`)

Test rapide avec un seul joueur :

```bash
# Test avec les paramètres par défaut (Pengu, uplay)
npm run test:quick

# Test avec un joueur spécifique
node quick-test.js "VotreNomDeJoueur" "uplay"
node quick-test.js "Beaulo" "uplay"
```

**Ce que ce test fait :**
- Test rapide de `getAccountInfo()`
- Test rapide de `getPlayerStats()`
- Test rapide de `getServiceStatus()`

### 3. Test API de l'application (`test-api.js`)

Test de l'API de votre application Next.js :

```bash
# Test complet de l'API (assurez-vous que le serveur Next.js est démarré)
npm run test:api

# Test avec un joueur spécifique
node test-api.js "VotreNomDeJoueur" "uplay" "complete"
```

**Ce que ce test fait :**
- Vérifie que le serveur Next.js est accessible
- Teste l'endpoint `/api/r6` avec différents paramètres
- Teste la connexion r6-data.js via l'API
- Affiche les données formatées de l'application

## Utilisation recommandée

### Étape 1: Test de base r6-data.js
```bash
npm run test:quick
```

### Étape 2: Si le test rapide fonctionne, test complet
```bash
npm run test:r6
```

### Étape 3: Test de l'API de l'application
```bash
# D'abord, démarrez le serveur Next.js dans un autre terminal
npm run dev

# Puis dans un autre terminal
npm run test:api
```

## Résolution des problèmes

### Erreur "Player not found"
- Vérifiez que le nom du joueur existe sur la plateforme spécifiée
- Essayez avec des joueurs connus comme "Pengu", "Beaulo", "KingGeorge"

### Erreur de timeout
- L'API Ubisoft peut être lente, c'est normal
- Augmentez le timeout dans les variables d'environnement si nécessaire

### Erreur de connexion
- Vérifiez votre connexion internet
- L'API Ubisoft peut parfois être indisponible

### Erreur "Cannot connect to server" (test-api.js)
- Assurez-vous que le serveur Next.js est démarré avec `npm run dev`
- Vérifiez que le port 3001 est libre ou ajustez l'URL dans le script

## Variables d'environnement

Assurez-vous d'avoir configuré votre fichier `.env.local` avec :

```env
# Timeout pour les requêtes API (en millisecondes)
API_TIMEOUT=15000

# URL de base pour l'application
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Autres configurations si nécessaires pour r6-data.js
```

## Exemples de sortie

### Test réussi :
```
✅ Account Info reçu: true
   - Niveau: 245
   - Username: Pengu
✅ Player Stats reçu: true
✅ Service Status reçu: true
🎉 Tous les tests sont passés !
```

### Test échoué :
```
❌ Erreur lors du test: Player not found
```

## Notes importantes

- Ces tests utilisent l'API officielle Ubisoft via r6-data.js
- Les données peuvent varier selon la disponibilité de l'API
- Certains joueurs peuvent avoir des profils privés
- Respectez les limites de taux de l'API Ubisoft