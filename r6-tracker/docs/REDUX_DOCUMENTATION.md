# 📚 Documentation Redux - R6 Tracker

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration du Store](#configuration-du-store)
4. [Les 5 Slices Redux](#les-5-slices-redux)
5. [Hooks personnalisés](#hooks-personnalisés)
6. [Redux Persist](#redux-persist)
7. [Patterns d'utilisation](#patterns-dutilisation)
8. [Flux de données](#flux-de-données)
9. [Optimisations](#optimisations)
10. [Exemples pratiques](#exemples-pratiques)

---

## 🎯 Vue d'ensemble

Le projet R6 Tracker utilise **Redux Toolkit** (version moderne de Redux) pour gérer l'état global de l'application. Redux est utilisé pour :

- ✅ **Authentification** (user, token, session)
- ✅ **Cache des données API** (opérateurs, armes, cartes)
- ✅ **Gestion des favoris** (opérateurs/armes/cartes favoris)
- ✅ **Filtres** (filtres actifs pour chaque page)
- ✅ **États de chargement** (loading, errors)

---

## 🏗️ Architecture

```
src/store/
├── index.ts                    # Configuration centrale du store
├── ReduxProvider.tsx           # Provider React pour Next.js
└── slices/                     # Slices Redux (états modulaires)
    ├── authSlice.ts           # 🔐 Authentification utilisateur
    ├── favoritesSlice.ts      # ⭐ Favoris utilisateur
    ├── operatorsSlice.ts      # 👤 Données opérateurs R6
    ├── weaponsSlice.ts        # 🔫 Données armes R6
    └── mapsSlice.ts           # 🗺️ Données cartes R6
```

---

## ⚙️ Configuration du Store

### `src/store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Configuration du storage (compatible SSR Next.js)
const storage = typeof window !== 'undefined' 
  ? createWebStorage('local') 
  : createNoopStorage();

// Configuration de persistence pour les maps
const mapsPersistConfig = {
  key: 'maps',
  storage,
  whitelist: ['imageCache']  // ⚠️ Seul le cache d'images est persisté
};

// Store Redux
export const store = configureStore({
  reducer: {
    operators: operatorsReducer,
    weapons: weaponsReducer,
    maps: persistReducer(mapsPersistConfig, mapsReducer),
    auth: authReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistor pour redux-persist
export const persistor = persistStore(store);

// Types TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### `src/store/ReduxProvider.tsx`

```typescript
'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
```

**Utilisé dans :** `src/app/layout.tsx`

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ReduxProvider>
          <Layout>{children}</Layout>
        </ReduxProvider>
      </body>
    </html>
  );
}
```

---

## 📦 Les 5 Slices Redux

### 1️⃣ authSlice - Authentification

**Fichier :** `src/store/slices/authSlice.ts`

#### État géré

```typescript
interface AuthState {
  user: User | null;           // Données utilisateur
  token: string | null;        // JWT token
  isAuthenticated: boolean;    // État authentification
  loading: boolean;            // Chargement en cours
  error: string | null;        // Messages d'erreur
}
```

#### Actions Asynchrones (Thunks)

```typescript
// Inscription
dispatch(register({ username, email, password, uplayProfile? }))

// Connexion
dispatch(login({ email, password }))

// Récupérer le profil
dispatch(getMe())
```

#### Actions Synchrones

```typescript
// Déconnexion
dispatch(logout())

// Effacer les erreurs
dispatch(clearError())

// Définir le token
dispatch(setToken(token))

// Restaurer le token depuis localStorage
dispatch(restoreToken())
```

#### Exemple d'utilisation

```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { login, logout } from '@/store/slices/authSlice';

function LoginForm() {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector(state => state.auth);

  const handleLogin = async (email: string, password: string) => {
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      console.log('✅ Connecté:', result.payload.user);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenue {user?.username}</p>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleLogin(email, password);
        }}>
          {/* Form fields */}
        </form>
      )}
    </div>
  );
}
```

---

### 2️⃣ operatorsSlice - Opérateurs R6

**Fichier :** `src/store/slices/operatorsSlice.ts`

#### État géré

```typescript
interface OperatorsState {
  operators: Operator[];           // Liste des opérateurs
  loading: boolean;                // Chargement en cours
  error: string | null;            // Messages d'erreur
  filters: OperatorFilters;        // Filtres actifs
  lastFetch: number | null;        // Timestamp dernier fetch
  cacheExpiry: number;             // Durée cache (30 min)
}
```

#### Actions Asynchrones

```typescript
// Récupérer les opérateurs (avec filtres optionnels)
dispatch(fetchOperators({
  side?: 'ATK' | 'DEF',
  role?: string,
  unit?: string,
  speed?: number,
  health?: number
}))
```

#### Actions Synchrones

```typescript
// Mettre à jour les filtres
dispatch(setFilters({ side: 'ATK', role: 'Intel' }))

// Vider le cache
dispatch(clearOperators())

// Effacer les erreurs
dispatch(clearError())
```

#### API appelée

```
GET /api/operators?side=ATK&role=Intel
```

**Réponse :**
```json
{
  "operators": [...],
  "count": 25,
  "cached": true,
  "timestamp": "2025-11-03T10:00:00Z"
}
```

---

### 3️⃣ weaponsSlice - Armes

**Fichier :** `src/store/slices/weaponsSlice.ts`

#### État géré

```typescript
interface WeaponsState {
  weapons: Weapon[];              // Liste des armes
  loading: boolean;               // Chargement en cours
  error: string | null;           // Messages d'erreur
  filters: WeaponFilters;         // Filtres actifs
  lastFetch: number | null;       // Timestamp dernier fetch
  cacheExpiry: number;            // Durée cache (30 min)
}
```

#### Actions Asynchrones

```typescript
// Récupérer les armes (avec filtres optionnels)
dispatch(fetchWeapons({
  category?: 'assault' | 'smg' | 'shotgun' | 'dmr' | 'sniper',
  operator?: string,
  side?: 'ATK' | 'DEF'
}))
```

#### Actions Synchrones

```typescript
// Mettre à jour les filtres
dispatch(setFilters({ category: 'assault' }))

// Vider le cache
dispatch(clearWeapons())

// Effacer les erreurs
dispatch(clearError())
```

---

### 4️⃣ mapsSlice - Cartes

**Fichier :** `src/store/slices/mapsSlice.ts`

#### État géré

```typescript
interface MapsState {
  maps: Map[];                        // Liste des cartes
  loading: boolean;                   // Chargement en cours
  error: string | null;               // Messages d'erreur
  filters: MapFilters;                // Filtres actifs
  lastFetch: number | null;           // Timestamp dernier fetch
  imageCache: Record<string, string>; // 🌟 Cache d'images (PERSISTÉ)
  cacheExpiry: number;                // Durée cache (30 min)
}
```

#### Actions Asynchrones

```typescript
// Récupérer les cartes
dispatch(fetchMaps())

// Mettre en cache une image de carte
dispatch(cacheMapImage('Bank'))
```

#### Actions Synchrones

```typescript
// Mettre à jour les filtres
dispatch(setFilters({ playlists: 'Ranked' }))

// Vider le cache
dispatch(clearMaps())

// Effacer les erreurs
dispatch(clearError())
```

#### ⭐ Particularité : Redux Persist

Le `imageCache` est **persisté dans localStorage** :

```typescript
// Configuration dans src/store/index.ts
const mapsPersistConfig = {
  key: 'maps',
  storage,
  whitelist: ['imageCache']  // Seul imageCache est sauvegardé
};
```

**Pourquoi ?**
- Les URLs d'images de cartes ne changent pas souvent
- Évite de recharger les images à chaque visite
- Améliore les performances de chargement

---

### 5️⃣ favoritesSlice - Favoris utilisateur

**Fichier :** `src/store/slices/favoritesSlice.ts`

#### État géré

```typescript
interface FavoritesState {
  favorites: Favorite[];      // Tous les favoris
  operators: Favorite[];      // Favoris opérateurs
  weapons: Favorite[];        // Favoris armes
  maps: Favorite[];          // Favoris cartes
  loading: boolean;          // Chargement en cours
  error: string | null;      // Messages d'erreur
}

interface Favorite {
  _id: string;
  userId: string;
  itemType: 'operator' | 'weapon' | 'map';
  itemId: string;
  itemName: string;
  metadata?: {
    image?: string;
    type?: string;
    side?: string;
    category?: string;
  };
  createdAt: string;
}
```

#### Actions Asynchrones

```typescript
// Récupérer tous les favoris
dispatch(fetchFavorites())

// Récupérer favoris par type
dispatch(fetchFavorites('operator'))

// Toggle un favori (ajouter/retirer)
dispatch(toggleFavorite({
  itemType: 'operator',
  itemId: 'ash',
  itemName: 'Ash',
  metadata: { side: 'ATK', image: 'ash.png' }
}))

// Vérifier si un élément est favori
dispatch(checkFavorite({ itemType: 'operator', itemId: 'ash' }))
```

#### Actions Synchrones (Optimistic Updates)

```typescript
// Ajouter localement (avant confirmation API)
dispatch(addFavoriteLocally(favorite))

// Retirer localement (avant confirmation API)
dispatch(removeFavoriteLocally({ itemType: 'operator', itemId: 'ash' }))

// Vider tous les favoris
dispatch(clearFavorites())

// Effacer les erreurs
dispatch(clearError())
```

---

## 🎣 Hooks personnalisés

**Fichier :** `src/hooks/useR6Data.ts`

Ces hooks encapsulent la logique Redux pour simplifier l'utilisation dans les composants.

### `useOperators()`

```typescript
import { useOperators } from '@/hooks/useR6Data';

function OperatorsPage() {
  const {
    operators,        // Operator[]
    loading,          // boolean
    error,           // string | null
    lastFetch,       // number | null
    filters,         // OperatorFilters
    loadOperators,   // (filters?) => void
    updateFilters,   // (filters) => void
    refreshOperators,// () => void
    clearError       // () => void
  } = useOperators();

  useEffect(() => {
    loadOperators({ side: 'ATK' });
  }, []);

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {operators.map(op => <div key={op.id}>{op.name}</div>)}
    </div>
  );
}
```

### `useWeapons()`

```typescript
import { useWeapons } from '@/hooks/useR6Data';

function WeaponsPage() {
  const {
    weapons,         // Weapon[]
    loading,         // boolean
    error,          // string | null
    lastFetch,      // number | null
    filters,        // WeaponFilters
    loadWeapons,    // (filters?) => void
    updateFilters,  // (filters) => void
    clearErrors     // () => void
  } = useWeapons();

  return (
    <div>
      {weapons.map(weapon => (
        <div key={weapon.id}>{weapon.name}</div>
      ))}
    </div>
  );
}
```

### `useMaps()`

```typescript
import { useMaps } from '@/hooks/useR6Data';

function MapsPage() {
  const {
    maps,            // Map[]
    loading,         // boolean
    error,          // string | null
    lastFetch,      // number | null
    filters,        // MapFilters
    imageCache,     // Record<string, string> - Cache d'images
    loadMaps,       // () => void
    updateFilters,  // (filters) => void
    loadMapImage,   // (mapName) => void - Charge une image
    clearErrors     // () => void
  } = useMaps();

  useEffect(() => {
    loadMaps();
    // Précharger les images
    maps.forEach(map => loadMapImage(map.name));
  }, [maps]);

  return (
    <div>
      {maps.map(map => (
        <img 
          key={map.id} 
          src={imageCache[map.name] || '/placeholder.png'} 
          alt={map.name} 
        />
      ))}
    </div>
  );
}
```

---

## 💾 Redux Persist

### Configuration actuelle

**Seul le cache d'images des maps est persisté :**

```typescript
const mapsPersistConfig = {
  key: 'maps',
  storage: localStorage,
  whitelist: ['imageCache']  // ⚠️ Seulement le cache d'images
};
```

### Ce qui est persisté ✅

| Donnée | Persisté | Storage | Durée |
|--------|----------|---------|-------|
| `maps.imageCache` | ✅ Oui | localStorage | Permanent |
| `auth.token` | ✅ Oui | localStorage | Jusqu'à logout |

### Ce qui N'EST PAS persisté ❌

| Donnée | Persisté | Raison |
|--------|----------|--------|
| `operators` | ❌ Non | Données chargées à chaque visite (cache API 30min) |
| `weapons` | ❌ Non | Données chargées à chaque visite (cache API 30min) |
| `maps.maps` | ❌ Non | Seules les URLs d'images sont persistées |
| `favorites` | ❌ Non | Rechargés depuis l'API à chaque visite |

### Pourquoi cette configuration ?

1. **Images de cartes** : Ne changent presque jamais → OK pour localStorage
2. **Données API** : Peuvent changer fréquemment → Cache serveur suffit (30 min)
3. **Favoris** : Doivent être synchronisés avec la BDD → Rechargés à chaque session

---

## 🔄 Patterns d'utilisation

### Pattern 1 : Hooks personnalisés (Recommandé)

```typescript
import { useOperators } from '@/hooks/useR6Data';

function MyComponent() {
  const { operators, loading, loadOperators } = useOperators();
  
  useEffect(() => {
    loadOperators();
  }, []);
  
  return <div>...</div>;
}
```

**Avantages :**
- ✅ Code plus propre
- ✅ Logique encapsulée
- ✅ Facilite les tests

**Utilisé dans :**
- `/operators/page.tsx`
- `/operators/[safename]/page.tsx`
- `/weapons/page.tsx`
- `/maps/page.tsx`

---

### Pattern 2 : Hooks Redux directs

```typescript
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchOperators } from '@/store/slices/operatorsSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { operators, loading } = useAppSelector(state => state.operators);
  const { user } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchOperators());
  }, []);
  
  return <div>...</div>;
}
```

**Avantages :**
- ✅ Plus de contrôle
- ✅ Accès à plusieurs slices
- ✅ Bon pour composants complexes

**Utilisé dans :**
- `/components/Navbar/Navbar.tsx`
- `/components/FavoriteButtonOptimized.tsx`

---

## 📊 Flux de données

### Exemple : Chargement des opérateurs

```
┌─────────────────────────────────────────────────────────────┐
│  1. Composant                                                │
│     const { operators, loadOperators } = useOperators()      │
│     loadOperators()                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Hook personnalisé (useR6Data.ts)                         │
│     dispatch(fetchOperators())                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Thunk Redux (operatorsSlice.ts)                          │
│     - État: loading = true                                   │
│     - Appel API: fetch('/api/operators')                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. API Route (/api/operators/route.ts)                      │
│     - Vérification cache (30 min)                            │
│     - Si expiré: fetch API externe                           │
│     - Retour données + métadonnées                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Thunk Redux - Succès                                     │
│     - État: operators = data, loading = false                │
│     - Console: "✅ 77 opérateurs récupérés"                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Composant - Re-render automatique                        │
│     - Affichage de la liste des opérateurs                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Optimisations

### 1. Cache API serveur (30 minutes)

```typescript
// Dans chaque slice
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Le thunk vérifie le cache avant de fetcher
if (cachedData && Date.now() - cached.timestamp < CACHE_DURATION) {
  return cachedData;
}
```

### 2. Logs conditionnels (dev only)

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Opérateurs chargés:', operators.length);
}
```

### 3. Redux Persist pour images

```typescript
// Cache localStorage pour les images de cartes
const mapsPersistConfig = {
  key: 'maps',
  storage,
  whitelist: ['imageCache']
};
```

### 4. Optimistic Updates (favoris)

```typescript
// Mise à jour immédiate de l'UI
dispatch(addFavoriteLocally(favorite));

// Puis appel API
const result = await dispatch(toggleFavorite(data));

// Si échec, rollback
if (toggleFavorite.rejected.match(result)) {
  dispatch(removeFavoriteLocally(favorite));
}
```

### 5. Hooks personnalisés avec useCallback

```typescript
const loadOperators = useCallback(
  (filters: OperatorFilters = {}) => {
    dispatch(fetchOperators(filters));
  },
  [dispatch]
);
```

---

## 💡 Exemples pratiques

### Exemple 1 : Page avec filtres

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useOperators } from '@/hooks/useR6Data';

export default function OperatorsPage() {
  const { operators, loading, error, updateFilters } = useOperators();
  const [selectedSide, setSelectedSide] = useState<'ATK' | 'DEF' | 'Tous'>('Tous');

  const handleFilterChange = (side: string) => {
    setSelectedSide(side);
    if (side !== 'Tous') {
      updateFilters({ side });
    } else {
      updateFilters({});
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <select value={selectedSide} onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="Tous">Tous</option>
        <option value="ATK">Attaquants</option>
        <option value="DEF">Défenseurs</option>
      </select>

      <div className="grid">
        {operators.map(op => (
          <div key={op.id}>
            <h3>{op.name}</h3>
            <p>{op.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Exemple 2 : Authentification

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { login } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

---

### Exemple 3 : Bouton Favori avec Redux

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleFavorite, fetchFavorites } from '@/store/slices/favoritesSlice';

interface FavoriteButtonProps {
  itemType: 'operator' | 'weapon' | 'map';
  itemId: string;
  itemName: string;
}

export default function FavoriteButton({ itemType, itemId, itemName }: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector(state => state.auth);
  const favorites = useAppSelector(state => state.favorites.favorites);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérifier si l'item est favori
  useEffect(() => {
    const favorite = favorites.find(
      f => f.itemType === itemType && f.itemId === itemId
    );
    setIsFavorite(!!favorite);
  }, [favorites, itemType, itemId]);

  // Charger les favoris au montage
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchFavorites());
    }
  }, [isAuthenticated, token, dispatch]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      alert('Connectez-vous pour ajouter des favoris');
      return;
    }

    setLoading(true);
    
    const result = await dispatch(toggleFavorite({
      itemType,
      itemId,
      itemName,
      metadata: { image: `/images/${itemType}/${itemId}.png` }
    }));

    setLoading(false);

    if (toggleFavorite.fulfilled.match(result)) {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !isAuthenticated}
      className={isFavorite ? 'favorite active' : 'favorite'}
    >
      {loading ? '⏳' : isFavorite ? '⭐' : '☆'}
      {isFavorite ? 'Retirer' : 'Ajouter'}
    </button>
  );
}
```

---

### Exemple 4 : Composant protégé (authentifié)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { getMe, restoreToken } from '@/store/slices/authSlice';

export default function ProtectedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Restaurer le token depuis localStorage
    dispatch(restoreToken());
    
    // Vérifier l'authentification
    dispatch(getMe()).then((result) => {
      if (getMe.rejected.match(result)) {
        router.push('/auth');
      }
    });
  }, [dispatch, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div>
      <h1>Bienvenue {user?.username}</h1>
      <p>Page protégée</p>
    </div>
  );
}
```

---

## 📈 Monitoring et Debugging

### Redux DevTools

Redux DevTools est automatiquement activé en développement. Pour l'utiliser :

1. Installer l'extension [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
2. Ouvrir les DevTools Chrome
3. Onglet "Redux" pour voir :
   - 📊 État global en temps réel
   - 🔄 Historique des actions
   - ⏱️ Time travel debugging
   - 📝 Logs des thunks

### Console Logs (dev only)

Tous les logs Redux sont conditionnels :

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('🌐 Récupération des opérateurs...');
  console.log('✅ 77 opérateurs chargés');
  console.error('❌ Erreur chargement:', error);
}
```

En production, **aucun log Redux** n'est affiché.

---

## 🎯 Bonnes pratiques

### ✅ DO (À faire)

1. **Utiliser les hooks personnalisés** quand possible
   ```typescript
   const { operators, loadOperators } = useOperators();
   ```

2. **Typer correctement les actions**
   ```typescript
   const result = await dispatch(fetchOperators({ side: 'ATK' }));
   if (fetchOperators.fulfilled.match(result)) {
     // Success
   }
   ```

3. **Gérer les états de chargement**
   ```typescript
   if (loading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

4. **Nettoyer les erreurs**
   ```typescript
   useEffect(() => {
     return () => {
       dispatch(clearError());
     };
   }, []);
   ```

5. **Utiliser useCallback pour les actions**
   ```typescript
   const handleLoad = useCallback(() => {
     dispatch(fetchOperators());
   }, [dispatch]);
   ```

---

### ❌ DON'T (À éviter)

1. **Ne pas modifier directement le state**
   ```typescript
   // ❌ Mauvais
   state.operators.push(newOperator);
   
   // ✅ Bon (Redux Toolkit le fait automatiquement avec Immer)
   state.operators = [...state.operators, newOperator];
   ```

2. **Ne pas dispatch dans le render**
   ```typescript
   // ❌ Mauvais
   function MyComponent() {
     dispatch(fetchOperators()); // À chaque render !
     return <div>...</div>;
   }
   
   // ✅ Bon
   function MyComponent() {
     useEffect(() => {
       dispatch(fetchOperators());
     }, []);
     return <div>...</div>;
   }
   ```

3. **Ne pas ignorer les erreurs**
   ```typescript
   // ❌ Mauvais
   dispatch(fetchOperators());
   
   // ✅ Bon
   const result = await dispatch(fetchOperators());
   if (fetchOperators.rejected.match(result)) {
     console.error('Erreur:', result.error);
   }
   ```

4. **Ne pas abuser de Redux**
   ```typescript
   // ❌ Mauvais - État local suffit
   const [formData, setFormData] = useState({...});
   
   // ✅ Bon - Redux pour état global uniquement
   const { user } = useAppSelector(state => state.auth);
   ```

---

## 🔧 Maintenance

### Ajouter un nouveau slice

1. Créer le fichier `src/store/slices/newSlice.ts`
2. Définir l'interface d'état
3. Créer les thunks (actions async)
4. Créer le slice avec `createSlice()`
5. Exporter le reducer
6. Ajouter au store dans `src/store/index.ts`
7. Créer un hook personnalisé dans `src/hooks/useR6Data.ts`

### Mettre à jour la persistance

Modifier `src/store/index.ts` :

```typescript
const newSlicePersistConfig = {
  key: 'newSlice',
  storage,
  whitelist: ['fieldToPersist']
};

export const store = configureStore({
  reducer: {
    // ...autres slices
    newSlice: persistReducer(newSlicePersistConfig, newSliceReducer),
  },
});
```

---

## 📚 Ressources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Persist](https://github.com/rt2zz/redux-persist)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [Next.js + Redux](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

---

## 🆘 FAQ

**Q: Pourquoi Redux au lieu de Context API ?**
A: Redux offre de meilleurs outils de debugging (DevTools), une meilleure performance pour les grandes apps, et une structure plus claire pour les actions asynchrones.

**Q: Les données sont-elles partagées entre les onglets ?**
A: Non, chaque onglet a son propre store Redux. Seules les données persistées (localStorage) sont partagées.

**Q: Comment vider le cache Redux ?**
A: Utilisez les actions `clear*` : `clearOperators()`, `clearWeapons()`, `clearMaps()`, `clearFavorites()`.

**Q: Pourquoi le cache expire après 30 minutes ?**
A: C'est un bon compromis entre performances et fraîcheur des données. Modifiable dans `cacheExpiry` de chaque slice.

**Q: Comment tester les composants Redux ?**
A: Utilisez `@testing-library/react` avec un store mocké ou le vrai store dans un provider de test.

---

**Dernière mise à jour :** 3 novembre 2025
**Version :** 1.0.0
