# Mosso: sağlam başlangıç ve canlı satış planı

## Karar 001 — Önce frontend, sonra backend

Kullanıcı önce mağazada gezinerek tasarımı görmek istiyor. Bu nedenle yerel örnek katalog var.
Next.js/React/TypeScript kullanılır; backend, ödeme sağlayıcısı ve veri depolama henüz bağlanmamıştır.
Frontend bileşenleri sunucu güvenliği sağlamaz. Sonraki aşamada katalog erişimi bir servis sınırına taşınır;
ürün detayları `/urun/[slug]` gibi sunucuda çözülebilen gerçek rotalara ayrılır.

## Karar 002 — Geçici sepet ile gerçek sipariş ayrımı

Tarayıcı yalnızca ürün kimliği, beden ve adet tutar. Geçersiz kayıtlar elenir.
Gerçek sistemde istemci fiyatı, indirimi, stok miktarını veya ödeme durumunu belirleyemez.
Sunucu ürün/varyant fiyatını kendi kaynağından okur. Siparişte satın alma anındaki fiyat ve vergi özeti saklanır.
Para kuruş cinsinden tamsayı veya uygun kesin ondalık veri tipiyle tutulur; kayan nokta kullanılmaz.

## Veri DevOps aşamaları (henüz kurulmadı)

| Uygulama                                 | Neden                                          | Kanıt / deney                                       |
| ---------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| PostgreSQL şeması + tek migration sahibi | Ortamları aynı tutmak                          | Boş DB'ye tüm migration zinciri                     |
| Mevcut sürümden yükseltme testi          | Dolu DB geçişi boş DB'den farklıdır            | Eski şema + sahte kayıtlarla yükseltme              |
| Expand/contract değişiklikleri           | Çalışan eski uygulamayla uyum                  | Eski/yeni sürüm uyumluluk testi                     |
| Sahte seed verileri                      | Testi tekrarlayabilmek                         | Deterministik katalog ve varyant örnekleri          |
| CI'da geçici PostgreSQL                  | Kod ve SQL sözleşmesini doğrulamak             | Entegrasyon, rollback ve constraint testleri        |
| Stok rezervasyonu + transaction          | Son ürünü iki kişiye satmamak                  | Eşzamanlı iki satın alma testi                      |
| Kısıtlı DB rolleri                       | Uygulamaya gereksiz yetki vermemek             | Uygulama rolü şema silememeli                       |
| Secret yöneticisi                        | Anahtarları Git'ten ayırmak                    | CI loglarında redaction; rotasyon tatbikatı         |
| Ayrı staging ve production               | Testin canlı veriye değmemesi                  | Ayrı hesap/anahtar/DB denetimi                      |
| Şifreli yedek + PITR                     | Kaza sonrası toparlanmak                       | İzole DB'ye geri yükleme, satır/sipariş tutarlılığı |
| RPO/RTO ve saklama politikası            | Kabul edilen kaybı/süreyi ölçmek               | Ölçülmüş geri yükleme raporu                        |
| Audit log + PII maskeleme                | İşlemleri incelemek, veri sızıntısını azaltmak | Yönetici değişikliği kaydı; logda kart/anahtar yok  |
| Sorgu/connection/lock izleme             | Yavaşlığı erken bulmak                         | Yük testi, alarm ve müdahale notu                   |

Migration'lar otomatik ve kontrolsüz biçimde canlıya uygulanmaz. Riskli veri değişikliklerinde yedek,
geri dönüş veya ileri düzeltme planı ve kilitlenme etkisi gözden geçirilir. Kod rollback'i veritabanı rollback'i değildir.
Yedeklerin erişimi ve saklama süresi de kişisel veri politikasıyla uyumlu tasarlanır.

## Ödeme aşaması

- Sağlayıcı başvurusu ve sözleşmesi tamamlandıktan sonra test anahtarlarıyla başlanır.
- Kart girişi sağlayıcının uygun barındırılmış/korumalı akışıyla yapılır; kart/CVV tutulmaz, loglanmaz.
- Dönüş sayfası ödeme kanıtı değildir: backend sağlayıcı bildirimini doğrular ve gerekirse sağlayıcıdan sorgular.
- Webhook imzası, zaman/replay kontrolleri ve tekil event/işlem anahtarları uygulanır.
- Sipariş durum makinesi: oluşturuldu, ödeme bekliyor, ödendi, hazırlanıyor, gönderildi, iptal/iade.
- Yinelenen/sırası değişen bildirim, timeout, başarısız ödeme, iade ve mutabakat testleri yazılır.
- Kimlik doğrulama, HttpOnly/Secure/SameSite oturum, CSRF, yetki kontrolü, giriş denemesi sınırlama ve yönetici 2FA eklenir.
- CSP/nonce ve sağlayıcıya ait gerekli alan adları gerçek entegrasyonla belirlenir. HTTPS/HSTS dağıtım ortamında doğrulanır.
- PCI kapsamı sağlayıcının entegrasyon şekline göre ayrıca değerlendirilir; kart tutmamak tüm yükümlülükleri ortadan kaldırmaz.

## CI ile CD farkı

CI kodu doğrular. CD doğrulanmış paketi ortama taşır. İlk sürüm yalnızca CI hazırlığı içerir.
Sonra staging'e otomatik dağıtım, smoke test ve production için onay kapısı kurulur.
Aynı doğrulanmış artifact ortamlar arasında taşınır; farklı ortamda tekrar derleyip fark yaratılmaz.
Image digest, kaynak commit'i ve migration sürümü yayın kaydında tutulur.

## Canlıya çıkış kapısı

- [ ] Gerçek ürün, varyant, fiyat, fotoğraf ve stok doğrulandı.
- [ ] Müşteri/yönetici yetkileri ve gizli anahtar yönetimi test edildi.
- [ ] Ödeme, webhook, iade ve mutabakat senaryoları geçti.
- [ ] Eşzamanlı stok testi ve migration zinciri geçti.
- [ ] Staging/production ayrımı, yedek ve geri yükleme tatbikatı doğrulandı.
- [ ] Hukuki metinler, kargo/fatura süreçleri işletme tarafından kesinleştirildi.
- [ ] Güvenlik, bağımlılık, erişilebilirlik ve performans kontrolleri tamamlandı.
- [ ] HTTPS, CSP, izleme, alarmlar ve müdahale sorumluları tanımlandı.
- [ ] Veri etkisini de kapsayan geri dönüş planı test edildi.

Kubernetes, Kafka veya çok servisli mimari bu aşamada gerekçesiz eklenmez.
Her yeni operasyon aracı bir problemi çözmeli ve bakım maliyeti anlaşılmalıdır.
