# 🛡️ Validation Zod - R6 Tracker

Documentation complète sur la validation des données avec Zod dans le projet R6 Tracker.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Installation](#installation)
- [Schémas disponibles](#schémas-disponibles)
- [Utilisation côté client](#utilisation-côté-client)
- [Utilisation côté serveur](#utilisation-côté-serveur)
- [API Client validé](#api-client-validé)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Exemples pratiques](#exemples-pratiques)

---

## 🎯 Vue d'ensemble

Zod est utilisé pour valider les données à la fois côté client et côté serveur, garantissant :
- ✅ Type-safety avec TypeScript
- ✅ Validation des formats (email, URL, regex)
- ✅ Messages d'erreur personnalisés en français
- ✅ Prévention des injections et données malveillantes
- ✅ Documentation auto-générée des types

---

## 📦 Installation

Zod est déjà installé dans le projet :

```bash
npm install zod
```

---

## 📑 Schémas disponibles

### Authentification (`src/schemas/auth.schema.ts`)

#### `registerSchema`
```typescript
{
  username: string (3-30 chars, alphanumeric + _ -)
  email: string (format email valide)
  password: string (min 6 chars)
  uplayProfile?: string (optionnel)
}
```

#### `loginSchema`
```typescript
{
  email: string (format email valide)
  password: string (requis)
}
```

#### `updateProfileSchema`
```typescript
{
  username?: string (3-30 chars, alphanumeric + _ -)
  avatar?: string (URL valide ou vide)
  uplayProfile?: string (optionnel)
}
```

### R6 API (`src/schemas/r6.schema.ts`)

#### `getAccountInfoSchema`
```typescript
{
  action: 'getAccountInfo'
  nameOnPlatform: string (1-50 chars)
  platformType: 'uplay' | 'pc' | 'playstation' | 'psn' | 'xbox' | 'xbl'
}
```

#### `getPlayerStatsSchema`
```typescript
{
  action: 'getPlayerStats'
  nameOnPlatform: string (1-50 chars)
  platformType: 'uplay' | 'pc' | 'playstation' | 'psn' | 'xbox' | 'xbl'
  platform_families: 'pc' | 'console'
}
```

### Favoris (`src/schemas/favorites.schema.ts`)

#### `addFavoriteSchema`
```typescript
{
  itemId: string (requis)
  itemType: 'operator' | 'weapon' | 'map'
  itemName?: string (optionnel)
}
```

---

## 💻 Utilisation côté client

### Méthode 1 : API Client validé (Recommandé)

```typescript
import { authApi } from '@/lib/api-client';

// Connexion
const result = await authApi.login({
  email: 'user@example.com',
  password: 'password123',
});

if (result.success) {
  console.log('Connecté !', result.token);
} else {
  console.error('Erreur:', result.error);
  console.error('Détails:', result.validationErrors);
}
```

### Méthode 2 : Validation manuelle

```typescript
import { validateClientData } from '@/lib/validation';
import { loginSchema } from '@/schemas/auth.schema';

const formData = {
  email: 'user@example.com',
  password: 'pass123',
};

const validation = validateClientData(loginSchema, formData);

if (validation.success) {
  // Données valides
  const { email, password } = validation.data;
  // Envoyer à l'API
} else {
  // Afficher les erreurs
  Object.keys(validation.errors).forEach(key => {
    console.error(`${key}: ${validation.errors[key].join(', ')}`);
  });
}
```

---

## 🔧 Utilisation côté serveur

### Dans une route API

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateData } from '@/lib/validation';
import { registerSchema } from '@/schemas/auth.schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validation automatique
  const validation = validateData(registerSchema, body);
  
  if (!validation.success) {
    return validation.response; // Retourne automatiquement une erreur 400
  }
  
  // Données validées et type-safe
  const { username, email, password } = validation.data;
  
  // Traiter la requête...
}
```

---

## 🚀 API Client validé

Le fichier `src/lib/api-client.ts` fournit des fonctions pré-validées pour tous les appels API.

### Authentification

```typescript
import { authApi } from '@/lib/api-client';

// Inscription
const registerResult = await authApi.register({
  username: 'Player1',
  email: 'player1@example.com',
  password: 'securepass123',
  uplayProfile: 'Player1_Uplay',
});

// Connexion
const loginResult = await authApi.login({
  email: 'player1@example.com',
  password: 'securepass123',
});

// Mise à jour du profil
const token = localStorage.getItem('token');
const updateResult = await authApi.updateProfile({
  username: 'NewUsername',
  avatar: 'https://example.com/avatar.jpg',
}, token!);

// Récupérer le profil
const profileResult = await authApi.getProfile(token!);
```

### R6 Data

```typescript
import { r6Api } from '@/lib/api-client';

// Informations du compte
const accountResult = await r6Api.getAccountInfo({
  action: 'getAccountInfo',
  nameOnPlatform: 'Player1',
  platformType: 'uplay',
});

// Statistiques du joueur
const statsResult = await r6Api.getPlayerStats({
  action: 'getPlayerStats',
  nameOnPlatform: 'Player1',
  platformType: 'uplay',
  platform_families: 'pc',
});
```

### Favoris

```typescript
import { favoritesApi } from '@/lib/api-client';

const token = localStorage.getItem('token')!;

// Ajouter un favori
const addResult = await favoritesApi.add({
  itemId: 'ash',
  itemType: 'operator',
  itemName: 'Ash',
}, token);

// Supprimer un favori
const removeResult = await favoritesApi.remove({
  itemId: 'ash',
  itemType: 'operator',
}, token);

// Vérifier si un élément est favori
const checkResult = await favoritesApi.check({
  itemId: 'ash',
  itemType: 'operator',
}, token);

// Récupérer tous les favoris
const allFavorites = await favoritesApi.getAll(token);
```

---

## ⚠️ Gestion des erreurs

### Format des erreurs de validation

```typescript
{
  success: false,
  error: 'Erreur de validation',
  validationErrors: {
    'email': ['Adresse email invalide'],
    'password': ['Le mot de passe doit contenir au moins 6 caractères'],
    'username': ['Le nom d\'utilisateur ne peut contenir que des lettres...']
  }
}
```

### Afficher les erreurs dans React

```typescript
const [errors, setErrors] = useState<Record<string, string[]>>({});

const handleSubmit = async (data: any) => {
  const result = await authApi.login(data);
  
  if (!result.success) {
    if (result.validationErrors) {
      setErrors(result.validationErrors);
    } else {
      // Erreur générale
      alert(result.error);
    }
  }
};

// Dans le JSX
{errors.email && (
  <p className="text-red-500">{errors.email[0]}</p>
)}
```

### Extraire le premier message d'erreur

```typescript
import { getFirstErrors } from '@/lib/validation';

const firstErrors = getFirstErrors(result.validationErrors);
// { email: 'Adresse email invalide', password: 'Mot de passe requis' }
```

---

## 💡 Exemples pratiques

### Exemple 1 : Formulaire de connexion

```typescript
'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api-client';
import { getFirstErrors } from '@/lib/validation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await authApi.login({ email, password });

    if (result.success) {
      localStorage.setItem('token', result.token);
      window.location.href = '/dashboard';
    } else {
      if (result.validationErrors) {
        setErrors(getFirstErrors(result.validationErrors));
      } else {
        alert(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        {errors.password && <p className="text-red-500">{errors.password}</p>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

### Exemple 2 : Validation en temps réel

```typescript
import { validateClientData } from '@/lib/validation';
import { registerSchema } from '@/schemas/auth.schema';

const [username, setUsername] = useState('');
const [usernameError, setUsernameError] = useState('');

const validateUsername = (value: string) => {
  const result = validateClientData(
    registerSchema.pick({ username: true }),
    { username: value }
  );
  
  if (!result.success) {
    setUsernameError(result.errors.username?.[0] || '');
  } else {
    setUsernameError('');
  }
};

// Dans le JSX
<input
  value={username}
  onChange={(e) => {
    setUsername(e.target.value);
    validateUsername(e.target.value);
  }}
  onBlur={() => validateUsername(username)}
/>
{usernameError && <p className="text-red-500">{usernameError}</p>}
```

---

## 🔒 Sécurité

### Ce que Zod prévient :

- ✅ Injection SQL (validation des formats)
- ✅ XSS (validation des URLs et HTML)
- ✅ Données manquantes ou invalides
- ✅ Types incorrects
- ✅ Longueurs de chaînes dépassées
- ✅ Formats d'email/URL invalides

### Ce que Zod ne fait PAS :

- ❌ Authentification (utilisez JWT)
- ❌ Autorisation (vérifiez les permissions)
- ❌ Rate limiting (utilisez un middleware)
- ❌ Sanitisation HTML (utilisez DOMPurify si nécessaire)

---

## 📚 Ressources

- [Documentation officielle Zod](https://zod.dev/)
- [Zod avec TypeScript](https://zod.dev/?id=basic-usage)
- [Schémas Zod avancés](https://zod.dev/?id=objects)

---

**✨ Avec Zod, vos données sont toujours valides et type-safe !**
