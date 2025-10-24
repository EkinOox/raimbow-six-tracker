import { getMapCallImages } from '@/lib/mapImages';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import MapGallery from '@/components/MapGallery';

interface Params {
  params: { slug: string };
}

export default function MapDetailPage({ params }: Params) {
  const { slug } = params;

  // récupérer les images côté serveur
  const images = getMapCallImages(slug);

  // Grouper par étages
  const grouped = images.reduce<Record<string, string[]>>((acc, cur) => {
    acc[cur.floor] = acc[cur.floor] || [];
    acc[cur.floor].push(cur.file);
    return acc;
  }, {});


  return (
    <div className="container mx-auto py-8 px-4">
      <SectionHeader
        title={`Map: ${slug.replace(/-/g, ' ')}`}
        description={`Détails et calques pour ${slug.replace(/-/g, ' ')}`}
        icon="pi-map"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MapGallery grouped={grouped} slug={slug} />
        </div>

        <aside className="md:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white mb-2">Infos</h4>
            <p className="text-white/60 mb-2">Slug: {slug}</p>
            <Link href="/maps" className="text-blue-400 underline">Retour aux maps</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
