import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const ROOT = 'src/assets';

const configs = [
  // Gallery images — displayed at ~202px in grid, overlay up to 90vw. 600px covers both well.
  { glob: 'modeling/', maxWidth: 600, quality: 75, format: 'webp' },
  { glob: 'collage/', maxWidth: 600, quality: 75, format: 'webp' },

  // Small logos/icons — displayed at 30-40px, 2x retina = 80px
  { files: ['CD_untitled.webp', 'GE_logo.webp', 'untitled-logo.webp'], maxWidth: 80, quality: 80, format: 'webp' },

  // Nav/mark logos — displayed at 37px, 2x retina = 80px
  { files: ['Olu logo_Dark_no_bkrgd.png', 'Olu logo_Light_no_bkrgd.png'], maxWidth: 80, quality: 80, format: 'png' },
];

async function getFiles(dir) {
  const entries = await readdir(dir);
  return entries.filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f)).map(f => join(dir, f));
}

async function optimizeFile(filePath, { maxWidth, quality, format }) {
  const before = (await stat(filePath)).size;
  let img = sharp(filePath);
  const meta = await img.metadata();

  if (meta.width > maxWidth) {
    img = img.resize(maxWidth, null, { withoutEnlargement: true });
  }

  let buffer;
  if (format === 'png') {
    buffer = await img.png({ quality, compressionLevel: 9 }).toBuffer();
  } else {
    buffer = await img.webp({ quality, effort: 6 }).toBuffer();
  }

  // Write back via sharp to preserve format
  await sharp(buffer).toFile(filePath);

  const after = (await stat(filePath)).size;
  const savings = ((1 - after / before) * 100).toFixed(0);
  console.log(`  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (${savings}% saved)  ${filePath}`);
}

console.log('Optimizing images with sharp...\n');

for (const config of configs) {
  let files;
  if (config.glob) {
    const dir = join(ROOT, config.glob);
    files = await getFiles(dir);
  } else {
    files = config.files.map(f => join(ROOT, f));
  }

  for (const f of files) {
    try {
      await optimizeFile(f, config);
    } catch (err) {
      console.error(`  SKIP ${f}: ${err.message}`);
    }
  }
}

console.log('\nDone.');
