import { getMapCallImages } from '@/lib/mapImages';
import MapGallery from '@/components/MapGallery';
import type { Map } from '@/types/r6-api-types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fonction pour récupérer les données de la carte
async function getMapData(slug: string): Promise<Map | null> {
  try {
    // Appeler l'API pour récupérer toutes les cartes
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/maps`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const maps = data.maps || data; // L'API retourne { maps: [...] }
    
    // Trouver la carte correspondant au slug
    const mapName = slug.replace(/-/g, ' ');
    const map = maps.find((m: Map) => m.name.toLowerCase() === mapName.toLowerCase());
    
    return map || null;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return null;
  }
}

export default async function MapDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Récupérer les images côté serveur
  const images = getMapCallImages(slug);

  // Récupérer les données de la carte
  const mapData = await getMapData(slug);

  // Grouper par étages
  const grouped = images.reduce<Record<string, string[]>>((acc, cur) => {
    acc[cur.floor] = acc[cur.floor] || [];
    acc[cur.floor].push(cur.file);
    return acc;
  }, {});

  return <MapGallery grouped={grouped} slug={slug} mapData={mapData} />;
}
