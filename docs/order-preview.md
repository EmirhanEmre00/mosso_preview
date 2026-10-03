# Sipariş ve iade önizlemesi

Ürün detayındaki öneriler 12 ürünle başlar; aşağı kaydırdıkça 8'er ürün eklenir.
Geçerli ürün tekrar önerilmez, aynı kategorideki parçalar önce gelir. Katalog sonlu
olduğu için sonunda tüm ürünler gösterilir. Otomatik yükleme yoksa düğme çalışır.

Sipariş tamamlandığında teslimat adresinin ve seçilen fatura adresinin kopyası
siparişe eklenir. Adres defterindeki sonraki değişiklikler eski siparişi değiştirmez.
Adres ve sipariş bilgileri bu aşamada yalnızca sessionStorage'da, aynı tarayıcı
oturumunda tutulur. Eski kayıtlarda adres yoksa tahmin edilmez.

Aşamalar: Onay bekliyor → Sipariş alındı → Hazırlanıyor → Kargoya verildi → Teslim edildi.
Yeni deneme siparişi Sipariş alındı aşamasına girer. Kullanıcının istediği kurala göre
iptal Onay bekliyor ve Sipariş alındı aşamalarında açıktır; Hazırlanıyor aşamasından
itibaren kapanır. İade talebi olan ürün/adet tekrar iptal edilemez; diğer ürünler açık kalır. Düğmenin yanı sıra işlem fonksiyonu
da kontrol yapar. Kargom nerede düğmesi takip numarası yoksa kapalıdır; örnek
siparişlerde açtığı bilgi temsili bir durumdur, gerçek kargo servisini sorgulamaz.

İptal ve iade formunda ürünler renk ve bedenleriyle ayrı listelenir. Ürünler otomatik seçilmez;
müşteri hangi üründen kaç adet işlem yapacağını seçer ve onay penceresinde seçimini görür.
İşlem yalnızca seçilen adetlere uygulanır. Kısmi iptalde diğer ürünlerin sipariş aşaması değişmez;
tüm adetler iptal edilirse sipariş iptal edildi olur. Orijinal sipariş kaydı korunur,
iptaller ayrı adet kaydıyla, iadeler seçilen ürünleri içeren ayrı taleplerle tutulur.
Aynı ürünün kalan adetleri veya diğer ürünler için yeni talep açılabilir; önceki talepteki adetler
yeniden kullanılamaz. Geçersiz veya fazla adet, yinelenen satır ve seçim yapılmadan işlem reddedilir.
Eski tek iade kaydı, bütün ürünler için açılmış bir talep olarak okunur.

İade talebi iptal edilmemiş ürünlerde, teslimatı beklemeden neden belirtilerek oluşturulur. Akış:
Neden listeden seçilir; ek açıklama isteğe bağlıdır ve en fazla 1000 karakterdir.
Kategori işlem fonksiyonunda da doğrulanır. Seçim ve açıklama ayrı kaydedilir;
eski serbest metinli iade kayıtları okunmaya devam eder.
Vazgeçtim seçeneği yeni taleplerde sunulmaz. Yeni talep oluşturulduğunda iade
bölümüne kaydırılır ve kısa bir mor vurgu gösterilir; eski talepler açılırken ekran
kendiliğinden kaymaz. Azaltılmış hareket tercihinde kaydırma animasyonsuzdur.
İptal düğmesi ve iade formu gönderimi önce temaya uygun bir onay penceresi açar.
Geri dön, kapatma düğmesi, Escape ve pencere dışına tıklama işlem yapmaz;
iade formunun seçimleri korunur. Onay sırasında siparişin güncel durumu yeniden
kontrol edilir. Başarılı işlemde 3,2 saniyelik bildirim görünür: Seçtiğin ürünler iptal edildi
veya İade talebin alındı. İade tamamlandı bildirimi verilmez.
talep → geri gönderim → mağazada inceleme → mağaza onayı → ödeme iadesi → tamamlandı.
Arayüzde bu akış üç ana adımda gösterilir: İade talebi → Ürün kontrolü → Ödeme iadesi.
Seçilen 3. tasarım uygulanır: solda güncel durum, sağda üç parçalı çubuk ve talep bilgileri.
Gerçek alt durum başlıkta korunur; ödeme iadesi yalnızca completed durumunda tamamlandı görünür.
Müşteri arayüzü yalnızca talep açabilir. İnceleme, onay veya tamamlandı işlemini
müşteri yapamaz; bunlar canlı sürümde yetkili mağaza backend'i ve ödeme sağlayıcısının
doğrulanmış sonucu ile güncellenmelidir. Mevcut demo talebi kendiliğinden ilerletmez
ve mail, gerçek iade etiketi veya gerçek para iadesi oluşturmaz.

Ürün detayında ve ödeme ekranındaki ürünlerde yan yana renk daireleri seçilebilir.
Sepet satırı ürün + beden + renk ile tanımlanır; farklı renkler birbirine karışmaz.
Seçilen renk sipariş ve belgeye aktarılır. Eski renksiz sepet kayıtları ilk katalog rengini alır.
Renkler önizleme varyantlarıdır; görseller ilk rengin fotoğrafı olarak kalır ve bu açıkça belirtilir.
Gerçek renk/stock ve o renge ait fotoğraflar canlı ürün kataloğuyla tanımlanmalıdır.

Siparişlerim'deki Örnek sipariş aşamaları düğmesi dört temsili kayıt ekler. Yeni örneklerde
iki farklı ürün bulunur; biri iki adet olduğu için kısmi işlemler denenebilir. Önceden
oluşturulan siparişlerin ürünleri değiştirilmez.
Tüm aktif örnek kayıtlarda iade formu denenebilir. Örnek adres kullanıcı tarafından
verilen Emirhan Emre / Serdivan adresidir; telefon maskeli kalır. Önceden eklenmiş
DEMO-1ABC–DEMO-4ABC örneklerinin adresleri de güncellenir; diğer siparişlerin adres
kopyaları değiştirilmez. Örnek kargo firması Aras Kargo, takip numaraları uydurmadır
ve gerçek bir gönderi sorgusuna bağlanmaz. Üst bölüm durum ve kargo ilerlemesini
gösterir; iptal/iade işlemleri ürünlerin altında ikincil düğmelerdir.

Bu istemci kontrolleri gerçek işlem güvenliği sağlamaz. Canlıda kimlik/sipariş
sahipliği, durum geçişleri, tarihçe, kargo webhook'u ve ödeme iadesi backend'de
kontrol edilmelidir. Tarayıcı verisi doğrulanmış ödeme veya kargo durumu sayılmaz.
