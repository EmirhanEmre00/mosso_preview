import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { provinces, districtsFor } from '../lib/contact-validation.mjs';
import ids from '../lib/data/neighborhood-provinces.json' with { type: 'json' };

const read = (city) =>
  JSON.parse(
    readFileSync(
      new URL(`../public/data/neighborhoods/${ids[city]}.json`, import.meta.url),
      'utf8',
    ),
  );

test('every province and district has a local, distinct neighborhood/village list', () => {
  assert.equal(Object.keys(ids).length, 81);
  for (const city of provinces) {
    const places = read(city);
    assert.deepEqual(Object.keys(places).sort(), districtsFor(city).sort());
    for (const names of Object.values(places)) {
      assert.ok(names.length > 0);
      assert.equal(names.length, new Set(names).size);
      assert.ok(
        names.every(
          (name) => typeof name === 'string' && name.trim().length > 0 && name.length <= 150,
        ),
      );
    }
  }
  assert.ok(read('Sakarya').Serdivan.includes('Kemalpaşa'));
  assert.ok(read('Adıyaman').Besni.includes('Akdurak Köyü'));
  assert.notDeepEqual(read('Konya').Ereğli, read('Zonguldak').Ereğli);
});
