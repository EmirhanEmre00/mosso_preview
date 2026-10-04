import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Download the four 2025 TurkiyeAPI datasets into the supplied directory first.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/build-neighborhood-data.mjs <dataset-directory>');
const read = (name) => JSON.parse(readFileSync(resolve(source, `${name}.json`), 'utf8'));
const provinces = read('provinces');
const districts = read('districts');
const places = [
  ...read('neighborhoods'),
  ...read('villages').map((place) => ({ ...place, name: `${place.name} Köyü` })),
];
const output = resolve('public/data/neighborhoods');
mkdirSync(output, { recursive: true });
const index = {};
for (const province of provinces) {
  index[province.name] = province.id;
  const options = {};
  for (const district of districts.filter((item) => item.provinceId === province.id)) {
    options[district.name] = [
      ...new Set(places.filter((item) => item.districtId === district.id).map((item) => item.name)),
    ].sort((a, b) => a.localeCompare(b, 'tr'));
    if (!options[district.name].length)
      throw new Error(`No places for ${province.name}/${district.name}`);
  }
  writeFileSync(resolve(output, `${province.id}.json`), JSON.stringify(options) + '\n');
}
writeFileSync(
  resolve('lib/data/neighborhood-provinces.json'),
  JSON.stringify(index, null, 2) + '\n',
);
console.log(`Generated ${provinces.length} province files covering ${districts.length} districts.`);
