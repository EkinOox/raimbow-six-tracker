import fs from 'fs';
import path from 'path';

export type FloorKey = 'basement' | 'first' | 'second' | 'third' | 'roof' | 'other';

const floorOrder: FloorKey[] = ['basement', 'first', 'second', 'third', 'roof', 'other'];

function detectFloorFromFileName(fileName: string): FloorKey {
  const n = fileName.toLowerCase();
  if (n.includes('basement') || n.includes('bas')) return 'basement';
  if (n.includes('first') || n.includes('1st') || n === 'first') return 'first';
  if (n.includes('second') || n.includes('2nd') || n === 'second') return 'second';
  if (n.includes('third') || n.includes('3rd') || n === 'third') return 'third';
  if (n.includes('roof')) return 'roof';
  return 'other';
}

export function getMapCallImages(mapSlug: string) {
  // Some map folders use spaces instead of kebab-case (e.g. "club house" vs "club-house").
  // Try multiple candidate folder names so slugs generated from map names still resolve.
  const candidates = [
    mapSlug,
    // replace dashes with spaces: 'club-house' -> 'club house'
    mapSlug.replace(/-/g, ' '),
    // also try decodeURIComponent in case slugs were encoded
    decodeURIComponent(mapSlug),
  ];

  let callsDir: string | null = null;
  let foundCandidate = mapSlug;
  for (const candidate of candidates) {
    const p = path.join(process.cwd(), 'public', 'images', 'maps', 'calls', candidate);
    if (fs.existsSync(p)) {
      callsDir = p;
      foundCandidate = candidate;
      break;
    }
  }

  if (!callsDir) {
    return [] as { floor: FloorKey; file: string }[];
  }

  const files = fs.readdirSync(callsDir)
    .filter((f) => !f.startsWith('.'))
    .filter((f) => /\.(png|jpg|jpeg|webp|avif)$/i.test(f));

  const imagesByFloor: { floor: FloorKey; files: string[] }[] = [];

  const mapFloors = new Map<FloorKey, string[]>();

  files.forEach((file) => {
    const floor = detectFloorFromFileName(file);
  const relPath = `/images/maps/calls/${foundCandidate}/${file}`;
    const arr = mapFloors.get(floor) || [];
    arr.push(relPath);
    mapFloors.set(floor, arr);
  });

  // Build ordered result
  floorOrder.forEach((f) => {
    const filesForFloor = mapFloors.get(f);
    if (filesForFloor && filesForFloor.length > 0) {
      imagesByFloor.push({ floor: f, files: filesForFloor.sort() });
    }
  });

  // Any floors not matched
  for (const [f, filesForFloor] of mapFloors) {
    if (!floorOrder.includes(f)) {
      imagesByFloor.push({ floor: f, files: filesForFloor.sort() });
    }
  }

  // Flatten to array of pairs
  const result: { floor: FloorKey; file: string }[] = [];
  imagesByFloor.forEach((g) => {
    g.files.forEach((file) => result.push({ floor: g.floor, file }));
  });

  return result;
}
