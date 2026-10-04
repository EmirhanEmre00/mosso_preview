# İl, ilçe ve mahalle listeleri

`turkey-locations.json`, TurkiyeAPI'nin 2025 veri kümesinden 2 Ekim 2026'da
alınan 81 il ve 973 ilçenin yalnızca adlarını ve il–ilçe ilişkisini içerir.
Liste formda yerel olarak kullanılır; ziyaretçinin adresi bu servise gönderilmez.

Kaynak: https://github.com/ubeydeozdmr/turkiye-api

Dosyalar:

- https://api.turkiyeapi.dev/v2/datasets/2025/provinces.json
- https://api.turkiyeapi.dev/v2/datasets/2025/districts.json

`neighborhood-provinces.json` ve `public/data/neighborhoods/*.json`, aynı 2025
veri kümesinden 4 Ekim 2026'da alınmıştır. 32.254 mahalle ve 18.183 köyün
yalnızca adları ve il–ilçe ilişkileri tutulur. Köy seçeneklerine `Köyü` eklenir;
aynı ilçedeki yinelenen adlar tek seçeneğe indirgenir. Tüm 973 ilçe kapsanır.
Form, yalnızca seçilen ilin yerel JSON dosyasını yükler; dış API'ye istek yapmaz.

Ek kaynak dosyalar:

- https://api.turkiyeapi.dev/v2/datasets/2025/neighborhoods.json
- https://api.turkiyeapi.dev/v2/datasets/2025/villages.json

Yeniden üretmek için dört kaynak dosyayı bir dizine indirip proje kökünde
`node scripts/build-neighborhood-data.mjs <kaynak-dizini>` çalıştır.

MIT lisansı `TURKIYEAPI-LICENSE.txt` içinde korunmuştur. Kaynak bağımsız bir
projedir. İdari değişikliklerde liste ve ilişki testleri birlikte güncellenmelidir.
