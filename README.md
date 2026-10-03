# Mosso storefront

Mor/beyaz marka kimliğiyle kadın giyim mağazasının ilk frontend sürümü.
Hedef gerçek satış yapan bir mağazadır. **Bu aşama ödeme almayan, örnek verili yerel önizlemedir.**

Katalog: 24 örnek ürün, 10 ürün kategorisi, 12 temsili ürün fotoğrafı. Beden, renk,
fiyat ve indirim filtreleri; fiyat/yeni ürün sıralaması; mobil filtre paneli ve katlanabilir footer.
Responsive açıklamalar: [Ders 11](docs/responsive-guide.md).

## Başlat

Node.js 24 kullanın. Proje klasöründe:

```powershell
npm ci
npm run dev
```

Mağaza: http://127.0.0.1:3000 — Dersler: http://127.0.0.1:3000/ogrenme

`npm run dev` açıkken dosya değişiklikleri tarayıcıya yansır. Terminali kapatmak sunucuyu durdurur.

## Doğrulama

```powershell
npm run typecheck
npm test
npm run build
```

Yerel tarayıcı incelemesi: masaüstü ve mobil düzen, kategori, arama, filtre,
ürün/beden seçimi, favoriler, sepet, adet, kaldırma, yenilemede sepet, ödeme önizlemesi.
Gerçek ödeme, giriş, stok ve sipariş testi bu aşamada mümkün değildir.

## Dosya haritası

| Dosya                        | Görevi                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| `app/page.tsx`               | Mağaza giriş sayfası                                                 |
| `components/storefront.tsx`  | Ekranlar ve frontend etkileşimleri                                   |
| `app/globals.css`            | Renk, yazı, boşluk, masaüstü/mobil tasarım                           |
| `lib/products.ts`            | Geçici örnek katalog; backend aşamasında veri servisine taşınacak    |
| `lib/cart.mjs`               | Yerel sepet kaydının sağlamlık kontrolleri; güvenlik sınırı değildir |
| `app/ogrenme/page.tsx`       | Kullanıcı için on derslik açıklamalı rehber                          |
| `.github/workflows/ci.yml`   | Otomatik kalite kontrolleri                                          |
| `.github/dependabot.yml`     | Paket ve container taban sürümü güncelleme önerileri                 |
| `Dockerfile`, `compose.yaml` | Container çalışma ortamı                                             |
| `docs/production-plan.md`    | Canlı satış ve veri DevOps planı                                     |
| `docs/image-prompts.md`      | Üretilen görsellerin kaynak/prompt kaydı                             |

## DevOps: bugün ve sonra

- Şimdi: sürümü sabitlenmiş npm paketleri, tip kontrolü, sepet regresyon testleri, build,
  GitHub Actions tanımı, bağımlılık denetimi, Dependabot, çok aşamalı/root olmayan Docker paketi.
- GitHub Actions dosyası tek başına aktif bir kontrol değildir: GitHub'a gönderilmeli ve başarılı çalıştırma doğrulanmalıdır.
- Dal koruması ve zorunlu kontrol kuralları depo ayarlarında ayrıca etkinleştirilir; bu ilk sürümde otomatik etkinleştirildiği varsayılmaz.
- Sonra: backend, PostgreSQL, migration testleri, seed, staging, kontrollü CD, gizli anahtar yönetimi,
  ödeme testleri, izleme, yedek ve geri yükleme tatbikatı.
- Docker tag'i `node:24-alpine` kayan bir etikettir. Canlı yayın aşamasında test edilen digest'e sabitlenmeli ve yenileme politikası uygulanmalıdır.

Docker Desktop açıkken `docker compose up --build` ile http://127.0.0.1:3001 üzerinden deneyin.
`docker compose down` yalnızca bu Compose projesini durdurur. Bu aşamada veritabanı volume'u yoktur.

## Önemli sınırlar

- Sepet/favoriler yalnızca bu tarayıcıda `mosso-preview-v1` altında tutulur. Kişisel bilgi veya kart verisi saklanmaz.
- Fiyatlar, ürün adları ve görseller örnektir. Üretilen fotoğraflar gerçek stok fotoğrafı değildir.
- Figma referansı tarayıcıda görsel olarak incelendi; kaynak bileşenler kopyalanmadı. Uygulama Mosso için özgün kodlandı.
- Figma Community dosyasının demo lisansı doğrulanmadı; dosyadan bir varlık/kod aktarılmadı.
- Bu sürümde noindex açık. Canlı mağazada gerçek içerikle birlikte SEO ayarları ve ürün rotaları yeniden ele alınacak.
- Güvenlik başlıkları temel önlemlerdir; güvenlik denetimi ve ödeme uyumluluğu tamamlandığı anlamına gelmez.
- Önceki mimaride pnpm önerilmişti. Bu checkout'ta çalışan Node/npm ile başladık; tek kilit dosyası `package-lock.json` kullanılacak, paket yöneticileri karıştırılmayacak.

## GitHub akışı

1. `git switch -c codex/degisiklik-adi`: bağımsız çalışma dalı aç.
2. Dosyayı değiştir, `git diff` ile incele.
3. Test ve build çalıştır.
4. İlgili dosyaları ekle ve açıklayıcı commit oluştur.
5. Dalı GitHub'a gönder, pull request aç.
6. Actions sonuçlarını ve diff'i incele. Başarısız kontrolü atlama.
7. İncelemeden sonra birleştir. Üretim yayını daha sonra onay kapısıyla kurulacak.

Komutları ezberlemekten önce her birinin hangi durumu değiştirdiğini öğrenmek hedefimizdir.
