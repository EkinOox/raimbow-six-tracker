#!/usr/bin/env node
/*
  Resize and recompress images sequentially.

  Usage examples:
    node scripts/resize-images.js --dir public/images --max-edge 800 --quality 70 --in-place

  Notes:
    - Requires the `sharp` package: npm i -D sharp
*/

const fs = require('fs');
const path = require('path');

function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// Try to load sharp and give a helpful error if missing
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  fail(
    '\n[resize-images] Le module "sharp" est requis.\n' +
      'Installez-le dans le dossier r6-tracker:\n' +
      '  npm i -D sharp\n\n' +
      `Détail: ${e.message}`
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) continue;
    const key = a.replace(/^--/, '');
    const next = args[i + 1];
    const isBool = next === undefined || next.startsWith('--');
    if (['in-place', 'recursive', 'dry-run', 'force', 'skip-if-larger'].includes(key)) {
      out[key] = true;
    } else if (!isBool) {
      out[key] = next;
      i++;
    } else {
      out[key] = true; // boolean flag without explicit value
    }
  }
  return out;
}

function toInt(val, def) {
  const n = Number.parseInt(val, 10);
  return Number.isFinite(n) ? n : def;
}

function isHidden(p) {
  return path.basename(p).startsWith('.');
}

function listFilesRecursive(root, exts) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      console.warn('[skip]', dir, '-', e.message);
      continue;
    }
    for (const ent of entries) {
      if (isHidden(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase().replace(/^\./, '');
        if (exts.has(ext)) files.push(full);
      }
    }
  }
  return files;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function processOne(file, opts, rootDir, outDir) {
  const rel = path.relative(rootDir, file);
  const dir = path.dirname(rel);
  const ext = path.extname(file); // preserve original extension
  const base = path.basename(file, ext);

  const srcStat = fs.statSync(file);
  const srcBytes = srcStat.size;

  const img = sharp(file, { failOn: 'none' });
  const meta = await img.metadata();

  const srcW = meta.width || null;
  const srcH = meta.height || null;

  const maxW = opts.maxWidth || opts.maxEdge || null;
  const maxH = opts.maxHeight || opts.maxEdge || null;

  const needResize =
    (!!maxW && srcW && srcW > maxW) || (!!maxH && srcH && srcH > maxH);

  if (!needResize && !opts.force) {
    if (opts.verbose) console.log('[skip small]', rel);
    return { file, rel, skipped: true };
  }

  let pipeline = sharp(file, { failOn: 'none' });
  if (needResize) {
    pipeline = pipeline.resize({
      width: maxW || undefined,
      height: maxH || undefined,
      fit: 'inside',
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    });
  }

  const fmt = (meta.format || ext.replace('.', '')).toLowerCase();
  if (fmt === 'jpeg' || fmt === 'jpg') {
    pipeline = pipeline.jpeg({
      quality: opts.quality,
      mozjpeg: true,
      chromaSubsampling: '4:2:0',
    });
  } else if (fmt === 'png') {
    pipeline = pipeline.png({
      compressionLevel: 9,
      effort: 7,
      palette: false, // set true if you want indexed-color reduction
    });
  } else if (fmt === 'webp') {
    pipeline = pipeline.webp({ 
      quality: opts.quality,
      effort: 6,
    });
  } else if (fmt === 'avif') {
    pipeline = pipeline.avif({ 
      quality: Math.max(30, Math.min(95, opts.quality)),
      effort: 4,
    });
  } else {
    // Pour les autres formats, utiliser toFormat avec options minimales
    try {
      pipeline = pipeline.toFormat(fmt);
    } catch (e) {
      console.warn(`Format non supporté: ${fmt}, conversion en PNG`);
      pipeline = pipeline.png({ compressionLevel: 9 });
    }
  }

  const isInPlace = opts.inPlace;
  let outPath;
  if (isInPlace) {
    outPath = file + `.tmp-${process.pid}`;
  } else {
    const suffix = opts.suffix ? String(opts.suffix) : '';
    outPath = path.join(outDir, dir, `${base}${suffix}${ext}`);
    ensureDir(path.dirname(outPath));
  }

  if (opts.dryRun) {
    console.log('[dry]', rel, '->', path.relative(rootDir, outPath));
    return { file, rel, dryRun: true };
  }

  await pipeline.toFile(outPath);
  const outBytes = fs.statSync(outPath).size;

  if (isInPlace) {
    const skipIfLarger = opts.skipIfLarger;
    const smaller = outBytes < srcBytes;
    if (skipIfLarger && !smaller) {
      // Do not replace if larger or equal
      fs.unlinkSync(outPath);
      if (opts.verbose) console.log('[kept original]', rel, `(${fmt})`);
      return { file, rel, keptOriginal: true, srcBytes, outBytes };
    }
    // Replace original atomically
    fs.renameSync(outPath, file);
  }

  return { file, rel, srcBytes, outBytes };
}

async function main() {
  const argv = parseArgs();

  const opts = {
    dir: path.resolve(process.cwd(), argv.dir || 'public/images'),
    out: argv.out ? path.resolve(process.cwd(), argv.out) : null,
    inPlace: Boolean(argv['in-place'] || (!argv.out)),
    recursive: true, // always recursive
    dryRun: Boolean(argv['dry-run'] || false),
    force: Boolean(argv['force'] || false),
    skipIfLarger: argv['skip-if-larger'] !== undefined ? Boolean(argv['skip-if-larger']) : true,
    quality: toInt(argv.quality, 80),
    maxWidth: toInt(argv['max-width'], undefined),
    maxHeight: toInt(argv['max-height'], undefined),
    maxEdge: toInt(argv['max-edge'], undefined),
    suffix: argv.suffix || '',
    verbose: Boolean(argv.verbose || false),
    formats: (argv.formats || 'jpg,jpeg,png,webp,avif')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  };

  if (!fs.existsSync(opts.dir) || !fs.statSync(opts.dir).isDirectory()) {
    fail(`[resize-images] Dossier introuvable: ${opts.dir}`);
  }

  if (!opts.inPlace) {
    if (!opts.out) fail('[resize-images] Veuillez préciser --out ou utilisez --in-place');
    ensureDir(opts.out);
  }

  if (!opts.maxWidth && !opts.maxHeight && !opts.maxEdge && !opts.force) {
    console.log('[info] Aucun max défini; utilisez --max-edge 1600 par ex.');
  }

  const exts = new Set(opts.formats);
  const all = listFilesRecursive(opts.dir, exts);
  if (all.length === 0) {
    console.log('[resize-images] Aucune image trouvée.');
    return;
  }

  console.log(`[resize-images] ${all.length} image(s) à traiter…`);
  let processed = 0;
  let savedTotal = 0;

  for (const file of all) {
    try {
      const outDir = opts.out || opts.dir;
      const res = await processOne(file, opts, opts.dir, outDir);
      if (res.skipped || res.dryRun) {
        // nothing
      } else if (res.keptOriginal) {
        const delta = res.outBytes - res.srcBytes;
        if (opts.verbose) console.log('[no gain]', res.rel, '+', delta, 'bytes');
      } else {
        processed++;
        const saved = (res.srcBytes || 0) - (res.outBytes || 0);
        savedTotal += Math.max(0, saved);
        const pct = res.srcBytes ? Math.round((1 - (res.outBytes / res.srcBytes)) * 100) : 0;
        console.log(`✔ ${res.rel}  ${Math.round((res.srcBytes || 0)/1024)}KB → ${Math.round((res.outBytes || 0)/1024)}KB (-${pct}%)`);
      }
    } catch (e) {
      console.warn('✖ Erreur:', path.relative(opts.dir, file), '-', e.message);
    }
  }

  console.log(`\n[resize-images] Terminé. Fichiers modifiés: ${processed}. Gain total ~${Math.round(savedTotal/1024)}KB.`);
}

main().catch((e) => fail(e.stack || e.message));
