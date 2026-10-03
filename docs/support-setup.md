# Destek mesajları

Sağ alttaki Destek düğmesi Formspree formuna JSON gönderir. GitHub Pages üzerinde
sunucu bulunmadığı için e-posta iletimini bu servis üstlenir; Gmail şifresi veya
gizli API anahtarı frontend'e eklenmez. Henüz form bağlantısı yapılandırılmamıştır.

1. [Formspree](https://formspree.io/) hesabında bir destek formu oluştur.
2. Mağaza alıcı adresini (önerilen mevcut adres: emrhnemre53@gmail.com) ekle ve
   e-postadaki doğrulamayı tamamla. Gelen kutusu ayarlarında bu adresi seç.
3. Integration bölümündeki `https://formspree.io/f/…` adresini `.env.local` içinde
   `NEXT_PUBLIC_SUPPORT_FORM_ENDPOINT` değişkenine koy; `.env.example` yalnızca şablondur.
4. Yerel sunucuyu yeniden başlat. Yayında değişkeni build ortamına ekleyip yeniden
   build/deploy yap. GitHub Pages workflow'u da build adımında bu değeri almalıdır.
5. Serviste spam korumasını ve gerçek site alan adı kısıtlamasını yapılandır.
   Hesabının gönderim limitini takip et. Bu formdaki honeypot tek başına güvenlik sınırı değildir.
6. Kendi deneme bilgilerinle bir mesaj gönder; servis panelini ve gelen kutusunu
   kontrol et. Gmail'de Yanıtla'nın ziyaretçinin adresine döndüğünü doğrula.

Formdaki `email` alanı Formspree'nin Reply-To adresidir. Mesaj yalnızca ad, e-posta,
isteğe bağlı telefon/sipariş numarası, konu ve mesaj içerir. Şifre, kart, adres,
doğum tarihi, profil tercihleri veya tarayıcı depoları gönderilmez.
Gönderim başarısız olursa form silinmez; bağlantı yokken gönder düğmesi pasiftir.

Giriş/profil halen demo olduğundan bilgiler doğrulanmış kullanıcı kimliği değildir.
Giriş/kayıt e-postası veya profil kaydında doldurulan iletişim bilgileri aynı sayfa
oturumunda forma gelir; çıkış ve yenileme sonrası saklanmaz. Canlı üyelikte bu
bilgiler doğrulanmış hesap servisinden alınmalıdır. Formspree kabulü başarı ekranını
açar; bu, e-postanın kesin gelen kutusuna teslim edildiğini kanıtlamaz.

Belgeler:

- [Formspree JavaScript gönderimi](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/)
- [Yanıtlama adresi](https://help.formspree.io/articles/building-your-form/email-reply-to-address/)
