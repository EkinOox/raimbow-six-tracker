# 🔌 Documentation API - R6 Tracker

Documentation complète des endpoints API de R6 Tracker.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Operators](#operators)
  - [Weapons](#weapons)
  - [Maps](#maps)
  - [Favorites](#favorites)
  - [R6 Data Proxy](#r6-data-proxy)
- [Codes de réponse](#codes-de-réponse)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Rate Limiting](#rate-limiting)
- [Cache](#cache)

---

## 🎯 Vue d'ensemble

L'API R6 Tracker est construite avec Next.js API Routes et utilise :

- **RESTful design** : Méthodes HTTP standard (GET, POST, PUT, DELETE)
- **JSON** : Format de données principal
- **JWT** : Authentification par token
- **Cache serveur** : 30 minutes par défaut
- **MongoDB** : Stockage des données

**Base URL (dev)** : `http://localhost:3000/api`  
**Base URL (prod)** : `https://r6tracker.com/api`

---

## 🔐 Authentification

### Obtenir un token JWT

**Endpoint** : `POST /api/auth/login`

**Body** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "Player1",
    "email": "user@example.com",
    "uplayProfile": "Player1_Uplay"
  }
}
```

### Utiliser le token

Ajouter le header `Authorization` à chaque requête protégée :

```http
GET /api/favorites
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔌 Endpoints

### Auth

#### 📝 Inscription

```http
POST /api/auth/register
Content-Type: application/json
```

**Body** :
```json
{
  "username": "Player1",
  "email": "player1@example.com",
  "password": "MotDePasse123!",
  "uplayProfile": "Player1_Uplay"  // Optionnel
}
```

**Réponse 201** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "Player1",
    "email": "player1@example.com",
    "uplayProfile": "Player1_Uplay",
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**Erreurs** :
- `400` : Email déjà utilisé
- `400` : Données manquantes ou invalides

---

#### 🔑 Connexion

```http
POST /api/auth/login
Content-Type: application/json
```

**Body** :
```json
{
  "email": "player1@example.com",
  "password": "MotDePasse123!"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "Player1",
    "email": "player1@example.com"
  }
}
```

**Erreurs** :
- `401` : Email ou mot de passe incorrect
- `400` : Données manquantes

---

#### 👤 Profil utilisateur

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Réponse 200** :
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "Player1",
    "email": "player1@example.com",
    "uplayProfile": "Player1_Uplay",
    "avatar": null,
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**Erreurs** :
- `401` : Token manquant ou invalide
- `404` : Utilisateur non trouvé

---

### Operators

#### 📋 Liste des opérateurs

```http
GET /api/operators
GET /api/operators?side=ATK
GET /api/operators?role=Intel&unit=NIGHTHAVEN
```

**Query Parameters** :
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `side` | string | ATK ou DEF | `ATK` |
| `role` | string | Rôle de l'opérateur | `Intel` |
| `unit` | string | Unité | `GIGN` |
| `speed` | number | Vitesse (1-3) | `3` |
| `health` | number | Santé (1-3) | `2` |

**Réponse 200** :
```json
{
  "operators": [
    {
      "id": "ash",
      "name": "Ash",
      "safename": "ash",
      "side": "ATK",
      "role": "Breach",
      "unit": "FBI SWAT",
      "ratings": {
        "health": 1,
        "speed": 3,
        "difficulty": 2
      },
      "bio": {
        "realname": "Eliza Cohen",
        "birthplace": "Jerusalem, Israel"
      },
      "season": "Release",
      "weapons": {
        "primary": ["R4-C", "G36C"],
        "secondary": ["5.7 USG", "M45 MEUSOC"]
      },
      "gadget": {
        "name": "Breaching Rounds",
        "description": "Explosive projectiles that destroy barricades and soft walls"
      }
    }
  ],
  "count": 1,
  "cached": true,
  "timestamp": "2025-11-03T10:00:00.000Z"
}
```

---

#### 🔍 Détail d'un opérateur

```http
GET /api/operators?name=Ash
```

**Réponse 200** :
```json
{
  "operators": [
    {
      "id": "ash",
      "name": "Ash",
      // ... (même structure que ci-dessus)
    }
  ],
  "count": 1
}
```

---

### Weapons

#### 🔫 Liste des armes

```http
GET /api/weapons
GET /api/weapons?category=assault
GET /api/weapons?operator=Ash
```

**Query Parameters** :
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `category` | string | Type d'arme | `assault`, `smg`, `shotgun` |
| `operator` | string | Nom de l'opérateur | `Ash` |
| `side` | string | ATK ou DEF | `ATK` |
| `name` | string | Nom de l'arme | `R4-C` |

**Réponse 200** :
```json
{
  "weapons": [
    {
      "id": "r4-c",
      "name": "R4-C",
      "category": "assault_rifle",
      "damage": 39,
      "fireRate": 860,
      "mobility": 50,
      "capacity": 30,
      "sight": ["Red Dot", "Holographic", "Reflex", "ACOG"],
      "barrel": ["Suppressor", "Flash Hider", "Compensator", "Muzzle Brake"],
      "grip": ["Vertical Grip", "Angled Grip"],
      "under_barrel": ["Laser"],
      "operators": ["Ash"],
      "side": "ATK"
    }
  ],
  "count": 1,
  "cached": true,
  "timestamp": "2025-11-03T10:00:00.000Z"
}
```

---

### Maps

#### 🗺️ Liste des cartes

```http
GET /api/maps
GET /api/maps?playlists=Ranked
GET /api/maps?name=Bank
```

**Query Parameters** :
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `name` | string | Nom de la carte | `Bank` |
| `playlists` | string | Type de playlist | `Ranked`, `Quick Match` |

**Réponse 200** :
```json
{
  "maps": [
    {
      "id": "bank",
      "name": "Bank",
      "location": "Los Angeles, California",
      "releaseDate": "2015-12-01",
      "playlists": "Ranked, Quick Match, Unranked",
      "mapReworked": null,
      "imageUrl": "/images/maps/bank.png"
    }
  ],
  "count": 1,
  "cached": true,
  "timestamp": "2025-11-03T10:00:00.000Z"
}
```

---

### Favorites

#### ⭐ Liste des favoris

```http
GET /api/favorites
GET /api/favorites?type=operator
Authorization: Bearer <token>
```

**Query Parameters** :
| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `type` | string | Type de favori | `operator`, `weapon`, `map` |

**Réponse 200** :
```json
{
  "favorites": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "itemType": "operator",
      "itemId": "ash",
      "itemName": "Ash",
      "metadata": {
        "image": "/images/operators/ash.png",
        "side": "ATK",
        "type": "operator"
      },
      "createdAt": "2025-11-03T10:00:00.000Z"
    }
  ],
  "grouped": {
    "operators": [...],
    "weapons": [...],
    "maps": [...]
  },
  "count": 1
}
```

---

#### ➕ Ajouter/Retirer un favori

```http
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "itemType": "operator",
  "itemId": "ash",
  "itemName": "Ash",
  "metadata": {
    "image": "/images/operators/ash.png",
    "side": "ATK"
  }
}
```

**Réponse 200 (Ajout)** :
```json
{
  "success": true,
  "action": "added",
  "favorite": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "itemType": "operator",
    "itemId": "ash",
    "itemName": "Ash",
    "metadata": {
      "image": "/images/operators/ash.png",
      "side": "ATK"
    },
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**Réponse 200 (Retrait)** :
```json
{
  "success": true,
  "action": "removed",
  "itemType": "operator",
  "itemId": "ash"
}
```

---

#### ✅ Vérifier si favori

```http
GET /api/favorites/check?type=operator&id=ash
Authorization: Bearer <token>
```

**Réponse 200** :
```json
{
  "isFavorite": true,
  "favorite": {
    "_id": "507f1f77bcf86cd799439011",
    "itemType": "operator",
    "itemId": "ash",
    "itemName": "Ash"
  }
}
```

---

### R6 Data Proxy

#### 📊 Données joueur R6

```http
POST /api/r6-data-proxy
Content-Type: application/json
```

**Body** :
```json
{
  "action": "getAccountInfo",
  "nameOnPlatform": "Player1",
  "platformType": "pc"
}
```

**Actions disponibles** :
- `getAccountInfo` : Informations du compte
- `getStats` : Statistiques complètes
- `getRankedStats` : Statistiques ranked
- `getCasualStats` : Statistiques casual

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "abc123-def456-ghi789",
      "name": "Player1",
      "platform": "pc",
      "level": 245,
      "avatar": "https://ubisoft-avatars.akamaized.net/..."
    },
    "stats": {
      "general": {
        "kills": 12543,
        "deaths": 10234,
        "kd": 1.23,
        "wins": 1234,
        "losses": 987,
        "winRate": 55.6
      },
      "ranked": {
        "rank": "Gold II",
        "mmr": 2734,
        "maxRank": "Platinum I",
        "maxMmr": 3154
      }
    }
  }
}
```

---

## 📊 Codes de réponse

| Code | Signification | Description |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée |
| `400` | Bad Request | Paramètres invalides |
| `401` | Unauthorized | Token manquant/invalide |
| `404` | Not Found | Ressource introuvable |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |
| `503` | Service Unavailable | API externe indisponible |

---

## ❌ Gestion des erreurs

### Format de réponse d'erreur

```json
{
  "error": "Message d'erreur lisible",
  "details": "Détails techniques (optionnel)",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-03T10:00:00.000Z"
}
```

### Exemples

**401 Unauthorized** :
```json
{
  "error": "Token JWT invalide ou expiré",
  "code": "INVALID_TOKEN"
}
```

**400 Bad Request** :
```json
{
  "error": "Paramètres manquants",
  "details": "Les champs 'email' et 'password' sont requis",
  "code": "MISSING_PARAMETERS"
}
```

**500 Internal Server Error** :
```json
{
  "error": "Erreur interne du serveur",
  "details": "Database connection failed",
  "code": "INTERNAL_ERROR"
}
```

---

## ⏱️ Rate Limiting

### Limites actuelles

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/api/auth/*` | 5 requêtes | 15 minutes |
| `/api/operators` | 60 requêtes | 1 minute |
| `/api/weapons` | 60 requêtes | 1 minute |
| `/api/maps` | 60 requêtes | 1 minute |
| `/api/favorites` | 30 requêtes | 1 minute |
| `/api/r6-data-proxy` | 10 requêtes | 1 minute |

### Headers de rate limit

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699012800
```

### Réponse 429

```json
{
  "error": "Rate limit dépassé",
  "retryAfter": 30,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## 💾 Cache

### Stratégie de cache

| Endpoint | Durée | Storage |
|----------|-------|---------|
| `/api/operators` | 30 minutes | Mémoire serveur |
| `/api/weapons` | 30 minutes | Mémoire serveur |
| `/api/maps` | 30 minutes | Mémoire serveur |
| Images maps | 24 heures | localStorage client |

### Headers de cache

**Cache hit** :
```http
X-Cache: HIT
X-Cache-Key: operators_all_all_all
X-Cache-Age: 1234
```

**Cache miss** :
```http
X-Cache: MISS
X-Cache-Key: operators_ATK_Intel_NIGHTHAVEN
```

### Invalider le cache

Le cache côté serveur est automatiquement invalidé après 30 minutes.

Pour forcer un rafraîchissement côté client :
```javascript
// Redux
dispatch(clearOperators());
dispatch(fetchOperators());
```

---

## 📚 Exemples de code

### JavaScript (Fetch API)

```javascript
// Connexion
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data.user;
  } else {
    throw new Error(data.error);
  }
}

// Récupérer les opérateurs
async function getOperators(filters = {}) {
  const params = new URLSearchParams(filters);
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/operators?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// Ajouter un favori
async function addFavorite(itemType, itemId, itemName) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      itemType,
      itemId,
      itemName,
      metadata: { image: `/images/${itemType}/${itemId}.png` }
    })
  });
  
  return await response.json();
}
```

### TypeScript (Next.js)

```typescript
// types.ts
interface Operator {
  id: string;
  name: string;
  side: 'ATK' | 'DEF';
  role: string;
  // ...
}

// api-client.ts
export async function getOperators(filters?: OperatorFilters): Promise<Operator[]> {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/api/operators?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch operators');
  }
  
  const data = await response.json();
  return data.operators;
}

// page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getOperators } from '@/lib/api-client';

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  
  useEffect(() => {
    getOperators({ side: 'ATK' })
      .then(setOperators)
      .catch(console.error);
  }, []);
  
  return (
    <div>
      {operators.map(op => (
        <div key={op.id}>{op.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔧 Testing

### Avec cURL

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Player1","email":"player1@test.com","password":"Test123!"}'

# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","password":"Test123!"}'

# Opérateurs (avec token)
curl http://localhost:3000/api/operators?side=ATK \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ajouter un favori
curl -X POST http://localhost:3000/api/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"itemType":"operator","itemId":"ash","itemName":"Ash"}'
```

### Avec Postman

1. Créer une collection "R6 Tracker API"
2. Ajouter les endpoints
3. Configurer une variable d'environnement `{{token}}`
4. Dans "Tests" de la requête login :
```javascript
pm.environment.set("token", pm.response.json().token);
```

---

**Dernière mise à jour** : 3 novembre 2025
