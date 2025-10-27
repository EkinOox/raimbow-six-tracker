// Utiliser un manifeste statique généré à la build-time pour éviter d'inclure
// le dossier `public/images` dans les bundles serverless.
// Le script `scripts/generate-map-manifest.js` génère `src/data/mapCallouts.json`.
import mapCallouts from '@/data/mapCallouts.json';

export type FloorKey = 'basement' | 'first' | 'second' | 'third' | 'roof' | 'other';

// Mapping simple pour déduire l'étage à partir du nom de fichier.
function detectFloorFromPath(p: string): FloorKey {
  const n = p.toLowerCase();
  if (n.includes('basement') || n.includes('/basement') || n.includes('bas')) return 'basement';
  if (n.includes('/first') || n.includes('1st') || n.includes('first')) return 'first';
  if (n.includes('/second') || n.includes('2nd') || n.includes('second')) return 'second';
  if (n.includes('/third') || n.includes('3rd') || n.includes('third')) return 'third';
  if (n.includes('/roof') || n.includes('roof')) return 'roof';
  return 'other';
}

const floorOrder: FloorKey[] = ['basement', 'first', 'second', 'third', 'roof', 'other'];

export function getMapCallImages(mapSlug: string) {
  // Supporter plusieurs variantes: 'stadium-alpha' -> 'stadium alpha' (manifest keys)
  const candidates = [mapSlug, mapSlug.replace(/-/g, ' '), decodeURIComponent(mapSlug)];

  let foundKey: string | undefined;
  for (const c of candidates) {
    if ((mapCallouts as Record<string, string[]>)[c]) {
      foundKey = c;
      break;
    }
  }

  if (!foundKey) return [] as { floor: FloorKey; file: string }[];

  const files = (mapCallouts as Record<string, string[]>)[foundKey] || [];

  // Grouper par étage et ordonner
  const mapFloors = new Map<FloorKey, string[]>();
  files.forEach((file) => {
    const floor = detectFloorFromPath(file);
    const arr = mapFloors.get(floor) || [];
    arr.push(file);
    mapFloors.set(floor, arr);
  });

  const imagesByFloor: { floor: FloorKey; files: string[] }[] = [];
  floorOrder.forEach((f) => {
    const filesForFloor = mapFloors.get(f);
    if (filesForFloor && filesForFloor.length) imagesByFloor.push({ floor: f, files: filesForFloor.sort() });
  });

  for (const [f, filesForFloor] of mapFloors) {
    if (!floorOrder.includes(f) && filesForFloor.length) imagesByFloor.push({ floor: f, files: filesForFloor.sort() });
  }

  const result: { floor: FloorKey; file: string }[] = [];
  imagesByFloor.forEach((g) => g.files.forEach((file) => result.push({ floor: g.floor, file })));

  return result;
}
