import fs from 'fs';
import path from 'path';

export type FloorKey = 'basement' | 'first' | 'second' | 'third' | 'roof' | 'other';

const floorOrder: FloorKey[] = ['basement', 'first', 'second', 'third', 'roof', 'other'];

function normalizeFileName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

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
  const callsDir = path.join(process.cwd(), 'public', 'images', 'maps', 'calls', mapSlug);

  if (!fs.existsSync(callsDir)) {
    return [] as { floor: FloorKey; file: string }[];
  }

  const files = fs.readdirSync(callsDir)
    .filter((f) => !f.startsWith('.'))
    .filter((f) => /\.(png|jpg|jpeg|webp|avif)$/i.test(f));

  const imagesByFloor: { floor: FloorKey; files: string[] }[] = [];

  const mapFloors = new Map<FloorKey, string[]>();

  files.forEach((file) => {
    const floor = detectFloorFromFileName(file);
    const relPath = `/images/maps/calls/${mapSlug}/${file}`;
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
