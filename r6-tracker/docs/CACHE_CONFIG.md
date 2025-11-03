# Configuration du Cache des Images

## Vue d'ensemble

Toutes les images dans l'application sont configurées pour être mises en cache pendant **au minimum 1 journée (24 heures)**.

## Configuration Next.js

### Headers HTTP (next.config.ts)

```typescript
// Cache pour les images statiques dans /public/images
{
  source: '/images/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  ],
}
```

**Explication :**
- `public`: L'image peut être mise en cache par le navigateur et les proxies/CDN
- `max-age=86400`: Cache dans le navigateur pendant 24 heures (86400 secondes)
- `s-maxage=86400`: Cache dans les CDN/proxies pendant 24 heures
- `stale-while-revalidate=604800`: Permet de servir une version en cache périmée pendant 7 jours tout en revalidant en arrière-plan

### Configuration des Images (next.config.ts)

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 86400, // 1 journée (24 heures)
  // ... autres options
}
```

## Utilisation dans les Composants

### Images Prioritaires (LCP - Largest Contentful Paint)

Pour les images critiques (hero, logos, above-the-fold) :

```tsx
<Image
  src="/images/logo/r6x-logo-ww.avif"
  alt="R6 Tracker Logo"
  width={80}
  height={80}
  priority
  quality={85}
  sizes="80px"
/>
```

### Images Standard (Lazy Loading)

Pour les images dans le viewport initial :

```tsx
<Image
  src={imageUrl}
  alt="Description"
  width={600}
  height={400}
  quality={75}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Images de Galerie (Thumbnails)

Pour les miniatures et aperçus :

```tsx
<Image
  src={thumbnailUrl}
  alt="Thumbnail"
  width={160}
  height={90}
  quality={70}
  loading="lazy"
  sizes="160px"
/>
```

## Durées de Cache

| Type d'image | Durée | Usage |
|--------------|-------|-------|
| **Images statiques** (logos, icônes) | 30 jours | Contenu immuable |
| **Images dynamiques** (maps, opérateurs, armes) | 24 heures | Contenu mis à jour régulièrement |
| **Images de profil** (avatars) | 1 heure | Peuvent changer fréquemment |

## Optimisations Appliquées

### 1. Formats Modernes
- AVIF (format préféré, meilleure compression)
- WebP (fallback pour navigateurs plus anciens)
- PNG/JPEG (fallback final)

### 2. Qualité d'Image
- **90%** : Logos et icônes statiques (qualité maximale)
- **85%** : Images prioritaires LCP
- **75%** : Images standard (bon compromis taille/qualité)
- **70%** : Thumbnails et miniatures

### 3. Sizes Attribute
Définit les tailles d'image en fonction des breakpoints :
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

### 4. Loading Strategy
- **`priority`** : Images above-the-fold (LCP)
- **`lazy`** : Images below-the-fold (chargement différé)

## Bibliothèque de Configuration

Fichier : `/src/lib/imageConfig.ts`

Constantes prédéfinies :
- `DEFAULT_IMAGE_CACHE` : Propriétés par défaut
- `PRIORITY_IMAGE_CACHE` : Images prioritaires
- `STATIC_IMAGE_CACHE` : Logos et icônes
- `AVATAR_IMAGE_CACHE` : Images de profil

### Exemple d'utilisation

```tsx
import { DEFAULT_IMAGE_CACHE } from '@/lib/imageConfig';

<Image
  src={imageUrl}
  alt="Description"
  width={600}
  height={400}
  {...DEFAULT_IMAGE_CACHE}
/>
```

## Composants Utilisant le Cache

| Composant | Configuration Cache |
|-----------|---------------------|
| `MapGallery.tsx` | Images principales: quality=85, thumbnails: quality=70 |
| `OperatorImage.tsx` | quality=75-85, lazy loading avec fallback |
| `Navbar.tsx` | Logo: quality=90, priority |
| `page.tsx` (accueil) | Hero: quality=70, Logo: quality=85, Features: quality=65 |
| `maps/page.tsx` | Cartes: quality=75, lazy loading |

## Performance

### Avantages du Cache
- ✅ Réduction de la bande passante (images servies depuis le cache)
- ✅ Amélioration du temps de chargement (pas de requête réseau)
- ✅ Meilleure expérience utilisateur (chargement instantané)
- ✅ Réduction de la charge serveur (moins de requêtes)

### Métriques Ciblées
- **LCP (Largest Contentful Paint)** : < 2.5s
- **FID (First Input Delay)** : < 100ms
- **CLS (Cumulative Layout Shift)** : < 0.1

## Revalidation

### Automatique
Les images sont automatiquement revalidées après expiration du cache (24h).

### Manuel
Pour forcer la revalidation d'une image :
1. Modifier le nom du fichier
2. Ajouter un paramètre de version : `image.png?v=2`
3. Vider le cache du navigateur (DevTools → Network → Disable cache)

## Tests

### Vérifier le Cache
1. Ouvrir DevTools → Network
2. Filtrer par "Img"
3. Recharger la page
4. Vérifier les en-têtes `Cache-Control` dans les réponses
5. Recharger à nouveau → les images doivent venir du cache (200 ou 304)

### Valider les Performances
```bash
npm run build
npm start
# Tester avec Lighthouse ou PageSpeed Insights
```

## Maintenance

### Points de Vigilance
- Vérifier régulièrement les Core Web Vitals
- Monitorer la taille des images (optimiser si > 200KB)
- Auditer les images inutilisées
- Mettre à jour les formats (AVIF > WebP > PNG/JPEG)

### Outils Recommandés
- [Squoosh](https://squoosh.app/) - Compression d'images
- [AVIF Converter](https://avif.io/) - Conversion AVIF
- [ImageOptim](https://imageoptim.com/) - Optimisation batch (macOS)
- Lighthouse - Audit de performance

## Ressources

- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [MDN Cache-Control](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers/Cache-Control)
- [Web.dev Image Performance](https://web.dev/fast/#optimize-your-images)
