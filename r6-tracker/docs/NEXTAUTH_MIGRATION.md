# 🔐 Migration vers NextAuth.js

## ✅ Ce qui a été implémenté

### 1. **Installation de NextAuth v5**
```bash
npm install next-auth@beta
```

### 2. **Configuration NextAuth** (`src/lib/auth.ts`)
- ✅ Credentials Provider avec validation Zod
- ✅ Connexion MongoDB pour vérification utilisateur
- ✅ Hachage bcrypt pour les mots de passe
- ✅ JWT strategy avec session de 30 jours
- ✅ **Cookies HTTP-only sécurisés** automatiques
- ✅ Callbacks personnalisés pour inclure `id` et `uplayProfile`

### 3. **Types TypeScript** (`src/types/next-auth.d.ts`)
Extension des types NextAuth pour inclure :
- `user.id`
- `user.uplayProfile`
- `session.user.id`
- `session.user.uplayProfile`

### 4. **Route API** (`src/app/api/auth/[...nextauth]/route.ts`)
- Gère automatiquement : `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`, etc.

### 5. **Middleware** (`src/middleware.ts`)
- ✅ Protection automatique des routes `/profile` et `/dashboard-new`
- ✅ Redirection vers `/auth` si non connecté
- ✅ Redirection vers `/dashboard-new` si déjà connecté sur `/auth`

### 6. **Providers**
- `AuthProvider` : Wrapper SessionProvider pour l'app
- Intégré dans `layout.tsx` avec ReduxProvider

### 7. **Hook personnalisé** (`src/hooks/useAuth.ts`)
```typescript
const { user, isAuthenticated, isLoading, session } = useAuth();
```

## 🔒 Sécurité des cookies

### Cookies HTTP-only automatiques
NextAuth configure automatiquement les cookies avec :
- ✅ **httpOnly: true** - Non accessible via JavaScript (protection XSS)
- ✅ **sameSite: 'lax'** - Protection CSRF
- ✅ **secure: true en production** - Transmission HTTPS uniquement
- ✅ **path: '/'** - Disponible sur toute l'app
- ✅ Nom: `next-auth.session-token`

### Avantages vs localStorage
| Feature | localStorage | NextAuth Cookies |
|---------|--------------|------------------|
| Accessible JS | ✅ | ❌ (HTTP-only) |
| Protection XSS | ❌ | ✅ |
| Protection CSRF | ❌ | ✅ (SameSite) |
| HTTPS obligatoire | ❌ | ✅ (en prod) |
| Expiration auto | ❌ | ✅ |
| Stockage côté | Client | Client + Serveur |

## 📝 Prochaines étapes (TODO)

### À migrer :
1. **Page `/auth`** - Remplacer le formulaire actuel
2. **Redux authSlice** - Migrer vers NextAuth
3. **Navbar** - Utiliser `useAuth()` au lieu de Redux
4. **Page `/profile`** - Utiliser session NextAuth
5. **Dashboard** - Utiliser session NextAuth
6. **Favoris** - Récupérer userId depuis session

### Exemple de migration :

#### ❌ Ancien (localStorage + Redux)
```typescript
const token = localStorage.getItem('token');
const { isAuthenticated } = useAppSelector(state => state.auth);
```

#### ✅ Nouveau (NextAuth)
```typescript
const { user, isAuthenticated } = useAuth();
// ou
const session = await auth(); // Server Component
```

## 🚀 Utilisation

### Client Component
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;
  
  return <div>Bonjour {user?.name}</div>;
}
```

### Server Component
```typescript
import { auth } from '@/lib/auth';

export default async function MyPage() {
  const session = await auth();
  
  if (!session) return <div>Non connecté</div>;
  
  return <div>Bonjour {session.user.name}</div>;
}
```

### API Route
```typescript
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  // Utiliser session.user.id, session.user.email, etc.
}
```

### Connexion / Déconnexion
```typescript
'use client';
import { signIn, signOut } from 'next-auth/react';

// Connexion
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false,
});

// Déconnexion
await signOut({ redirect: true, callbackUrl: '/auth' });
```

## 🔧 Configuration requise

### Variables d'environnement (`.env.local`)
```env
# NextAuth
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-in-production-2024
NEXTAUTH_URL=http://localhost:3000

# MongoDB (déjà existant)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
```

### En production :
```env
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=générer-avec-openssl-rand-base64-32
```

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth v5 (Auth.js)](https://authjs.dev/)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
- [JWT Strategy](https://next-auth.js.org/configuration/options#jwt)

---

**✨ NextAuth gère automatiquement la sécurité des cookies, les sessions, le CSRF, et bien plus !**
