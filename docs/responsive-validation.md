# Mobil düzenleme ve kontroller — 2 Ekim 2026

## Değişiklikler

- Mobil üst menü, logo/slogan, arama, hesap menüsü ve dokunma alanları düzenlendi.
- Ürün, hesap, adres, ödeme ve iade formlarında dar sütunlar ve metin taşmaları ele alındı.
- Mobil ödeme tek sayfa olarak kayar; masaüstündeki yapışkan sipariş özeti korunur.
- Sipariş detayında mobilde tekrar eden büyük hesap başlığı kaldırıldı; kargo aşamaları daha erken görünür.
- İade nedeni sağ üstte, ek açıklama hemen altında; çok dar ekranlarda bilgiler tek sütuna iner.
- Boş sepet içeriği, başlık dışında kalan alanın ortasında gösterilir.
- Telefon alanı rakamlara dönüştürülür; yerel Türkiye numarası 11 haneli, 0 ile başlayan biçimde doğrulanır. +90 ve 0090 yapıştırmaları desteklenir. Eksik/uzun numara kaydedilmez.
- Profil ve destekte telefon isteğe bağlı, adreslerde zorunludur. Destek gönderim katmanı da hatalı telefonu reddeder.
- 81 il / 973 ilçe yerel veriyle listelenir. İl değişince ilçe sıfırlanır; başka ile bağlı ilçe kaydedilemez. Veri kaynağı/lisans: `lib/data/README.md`.
- Fatura adresi kayıtlı adreslerden seçilir. Ödeme gönderiminde teslimat ve fatura seçimi yeniden doğrulanır.
- Mobil açılır pencerelerde arka sayfanın kayması engellenir; destek düğmesi daha az alan kaplar.

## Gerçekleştirilen kontroller

- `npm run typecheck`: başarılı.
- `npm test`: 29 test başarılı; telefon, il–ilçe ilişkisi, boş adres ve destek telefonu kontrolleri dahil.
- `npm run build`: başarılı; sekiz uygulama rotası ve bulunamayan sayfa statik olarak üretildi.
- Ana sayfa: 320, 360, 390, 430, 760, 1024 ve 1440 pikselde belge genişliği ekranı aşmadı.
- Ürün detayı: 320, 360, 390, 430 ve 760 pikselde yatay taşma çıkmadı. Renk değişiminde dairelerin x konumu sabit kaldı.
- 390 pikselde giriş, profil, adres defteri, sipariş listesi, ürün seçerek iade, onay penceresi ve talep sonrası kaydırma denendi.
- İl Sakarya'dan Konya'ya değiştirildiğinde Serdivan seçimi sıfırlandı; +90 telefonla geçerli adres kaydedildi.
- 320 pikselde ödeme adresi kaydı, ayrı fatura adresi seçimi, iyzico önizleme seçimi, MOSSO10 kuponu ve deneme siparişinin tamamlanması denendi.
- 320 pikselde boş sepet görsel olarak ortalandı; 77 piksel başlık altında kalan 663 piksel alanın merkezi kullanıldı.
- 320 pikselde filtre ve destek pencereleri incelendi. 844 × 390 yatay görünümde filtre alt düğmeleri ekran içinde kaldı.
- 1440 pikselde iade nedeninin sağ üstte, açıklamanın altında olduğu geometri ve ekran görüntüsüyle doğrulandı.

Ekran görüntüleri yerel `.preview/desktop-return-refinement.png` ve `.preview/mobile-order-refinement.png` dosyalarında tutulur.

Kontroller yerel geliştirme tarayıcısında yapılmıştır; gerçek iOS/Android donanımı üzerinde doğrulama değildir. Ödeme, kimlik doğrulama, fatura, iade ve destek servisi entegrasyonlarının mevcut önizleme sınırları devam eder. Denemelerde gerçek tahsilat veya e-posta gönderimi yapılmadı.
