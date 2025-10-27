const fs = require('fs');
const path = require('path');

const callsDir = path.join(process.cwd(), 'public', 'images', 'maps', 'calls');
const outDir = path.join(process.cwd(), 'src', 'data');
const outFile = path.join(outDir, 'mapCallouts.json');

function walkMaps() {
  if (!fs.existsSync(callsDir)) {
    console.warn('No calls dir found:', callsDir);
    return {};
  }

  const maps = fs.readdirSync(callsDir).filter((d) => {
    const p = path.join(callsDir, d);
    return fs.statSync(p).isDirectory();
  });

  const result = {};

  maps.forEach((map) => {
    const p = path.join(callsDir, map);
    const files = fs.readdirSync(p).filter((f) => !f.startsWith('.') && /\.(png|jpg|jpeg|webp|avif)$/i.test(f));
    // Build relative public paths
    result[map] = files.map((f) => `/images/maps/calls/${map}/${f}`);
  });

  return result;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(outDir);
  const manifest = walkMaps();
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Wrote manifest to', outFile);
}

main();
