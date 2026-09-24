# Ders 11 — Responsive tasarım: küçültmek yerine uyarlamak

## Ne yaptık?

Katalog 24 örnek ürüne, 10 ürün kategorisine çıktı. Tümü ve Yeni Gelenler ayrı koleksiyon görünümleridir.
12 özgün ürün görseli kullanılır; bazı benzer örnek ürünler aynı temsili fotoğrafı paylaşır.
Görseller gerçek mağaza stoğu değildir. Geniş katalog sunucudan gelmeden önce filtre ve gezinme davranışını görmemizi sağlar.

- Küçük telefonlarda üst şerit tek satır, hero yaklaşık 475–488 px; önceki 670 px yerine daha dengeli.
- Logo `object-fit: contain` ile tamamı görünür; negatif kenar kaydırması yok.
- Telefonlarda iki, tabletlerde üç, masaüstünde dört ürün sütunu.
- Kategori çipleri kendi satırında yatay kayar; bütün sayfayı yana taşırmaz.
- Filtre paneli ekran yüksekliğini aşmaz. İçeriği kayar, sonuç butonu altta erişilebilir kalır.
- Footer bağlantıları telefonlarda katlanır, masaüstünde açık görünür.
- Ürün detayında fotoğraf telefon ekran yüksekliğine göre sınırlanır, satın alma alanı okunabilir kalır.
- Uzun katalog önce 12 kayıt gösterir; daha fazla ürün isteğe bağlı açılır.
- Animasyonlar kısa tutulur; azaltılmış hareket tercihi dikkate alınır.

## Neden?

320 px telefonda dört sütun yapmak ürünleri okunmaz hale getirir. Masaüstü footer'ını aynen alt alta koymak
ise telefon ekranının birkaç katı yükseklik oluşturur. Responsive tasarım; boşluk, sütun sayısı, sıralama,
görsel boyutu ve kontrollerin davranışını birlikte değiştirir.

`px` ekran ölçüsünü, `svh` tarayıcının küçük görünür yüksekliğini, `dvh` değişen görünür yüksekliğini ifade eder.
Telefon adres çubuğu açılıp kapanırken sabit bir yükseklik seçmek taşmaya neden olabilir.

## Yapmasaydık?

Logo kesilebilir, filtre onay butonu ekran dışında kalabilir, sepet kapatılamayabilir veya sayfa yana kayabilir.
Sadece ana sayfanın ekran görüntüsünü kontrol etmek bu hataları yakalamaz: detay, boş sonuç, sepet ve filtre
açıkken de denemek gerekir.

## Sen dene

1. Tarayıcı geliştirici araçlarında cihaz görünümünü aç.
2. 320, 390, 430, 768, 1024 ve 1440 px genişlikleri sırayla dene; telefon yatay görünümünü de kontrol et.
3. Tüm koleksiyonda Mor rengi ve en yüksek 500 ₺ seç. İki örnek şal kalmalı.
4. Filtreleri temizle. 24 ürün geri gelmeli; Daha fazla ürün göster düğmesiyle hepsini aç.
5. Footer'da Koleksiyonu keşfet başlığını aç/kapat. İçerik silinmez, yalnızca ihtiyaç halinde gösterilir.
6. Sepete ekleme akışını dokunarak ve klavyeyle ayrı ayrı dene.

## DevOps bağlantısı

Kırpılan logo hatasını Playwright testine dönüştürdük. CI artık sekiz ekran genişliğinde logo/taşma kontrolünü,
dar ekran hero/footer yüksekliğini, sepet ve birleşik filtre davranışını denetliyor.
Bu testler her fiziksel cihazı temsil etmez; Safari/iOS, Android ve gerçek cihaz testleri canlıya çıkışta ayrıca yapılmalıdır.
