// Re-encode only: no retouching or changes to the generated designs.
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
const directory = new URL('../public/images/', import.meta.url);
for (const name of await readdir(directory)) {
  if (!name.endsWith('.png')) continue;
  const input = new URL(name, directory);
  const output = new URL(name.replace('.png', '.webp'), directory);
  await sharp(input.pathname.replace(/^\/([A-Za-z]:)/, '$1'))
    .resize({
      width: name.includes('editorial') ? 1672 : name.includes('logo') ? 800 : 800,
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toFile(output.pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  console.log(`${name}: ${(await stat(input)).size} → ${(await stat(output)).size} bytes`);
}
