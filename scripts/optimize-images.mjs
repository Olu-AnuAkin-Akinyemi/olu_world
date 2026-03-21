import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';

const ROOT = 'src/assets';

// Phase 1: Multi-resolution srcset pipeline
// Generates -400, -800, -1200 WebP variants alongside untouched originals.
// Never overwrites source files. Always compress from the original.

const SIZES = [400, 800, 1200];

const configs = [
  // Gallery collages — transparent PNGs, q80 WebP with alpha
  { glob: 'collage/', quality: 80, sizes: SIZES },

  // Modeling photos (future) — professional photography, q80
  { glob: 'modeling/', quality: 80, sizes: SIZES },
  {glob: 'epk/', quality: 80, sizes: SIZES },
];

async function getSourceFiles(dir) {
  const entries = await readdir(dir);
  // Only process original source files — skip already-generated variants (-400, -800, -1200)
  return entries
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f) && !/-\d+\.webp$/i.test(f))
    .map(f => join(dir, f));
}

async function generateVariants(filePath, { quality, sizes }) {
  const meta = await sharp(filePath).metadata();
  const name = basename(filePath, extname(filePath));
  const dir = join(filePath, '..');
  const hasAlpha = meta.channels === 4;

  console.log(`\n  ${name} (${meta.width}x${meta.height}, ch:${meta.channels})`);

  for (const width of sizes) {
    if (width > meta.width) {
      console.log(`    ${width}w — SKIP (source only ${meta.width}px wide)`);
      continue;
    }

    const outPath = join(dir, `${name}-${width}.webp`);
    const webpOpts = { quality, effort: 6 };
    if (hasAlpha) webpOpts.alphaQuality = 100;

    await sharp(filePath)
      .resize(width, null, { withoutEnlargement: true })
      .webp(webpOpts)
      .toFile(outPath);

    const outSize = (await stat(outPath)).size;
    console.log(`    ${width}w → ${(outSize / 1024).toFixed(0)}KB  ${outPath}`);
  }
}

console.log('Generating responsive image variants with sharp...');
console.log('Originals are preserved — only WebP variants are created.\n');

for (const config of configs) {
  const dir = join(ROOT, config.glob);
  let files;
  try {
    files = await getSourceFiles(dir);
  } catch {
    console.log(`  SKIP ${dir} (directory not found)`);
    continue;
  }

  if (files.length === 0) {
    console.log(`  SKIP ${dir} (no source files)`);
    continue;
  }

  console.log(`${dir} (${files.length} sources, q${config.quality}):`);

  for (const f of files) {
    try {
      await generateVariants(f, config);
    } catch (err) {
      console.error(`  ERROR ${f}: ${err.message}`);
    }
  }
}

console.log('\nDone.');
