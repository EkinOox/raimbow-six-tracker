import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Routes principales
  const routes = [
    '',
    '/maps',
    '/operators',
    '/weapons',
    '/search',
    '/comparaison',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // TODO: Ajouter dynamiquement les pages de détail des cartes/opérateurs
  // Exemple: /maps/[slug], /operators/[safename]

  return routes;
}
