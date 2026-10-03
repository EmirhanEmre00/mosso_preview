import Link from 'next/link';
const lessons = [
  {
    number: '00',
    title: 'Bu sürümde neler değişti?',
    what: '24 örnek ürün, 10 ürün kategorisi ve beden/renk/fiyat/indirim filtreleri eklendi. Telefonlarda üst tanıtım alanı kısaltıldı, footer bağlantıları açılır başlıklara dönüştü.',
    why: 'Responsive tasarım yalnızca ekranı küçültmek değildir. Aynı içeriği telefon, tablet ve masaüstünde farklı sütun, boşluk ve kontrol düzenleriyle sunarız.',
    without:
      'Dar cihazda logo kesilebilir, filtre düğmeleri dışarı taşabilir veya footer gereksiz uzun olabilir. Görsel inceleme ile otomatik ekran testlerini birlikte kullanıyoruz.',
    try: 'Koleksiyonda Mor ve en fazla 500 ₺ filtrelerini seç. İki örnek şal görmelisin. Telefonda en alta inip Koleksiyonu keşfet başlığını aç/kapat. Kod açıklamaları docs/responsive-guide.md dosyasında.',
  },
  {
    number: '01',
    title: 'Frontend ve backend: iki ayrı sorumluluk',
    what: 'Next.js ve React ile görünen ekranları, TypeScript ile veri tiplerini oluşturduk. Ürünler şu anda kod içindeki örnek katalogdan geliyor.',
    why: 'Önce alışveriş deneyimini görebilmek, tasarımı gerçek ödeme veya müşteri bilgisine dokunmadan geliştirmemizi sağlar. Bileşenler tekrar kullanılan ekran parçalarıdır; örneğin ürün kartını bir kez yazıp her üründe kullanırız.',
    without:
      'Her sayfayı ayrı ayrı kopyalayarak yazarsak bir tasarım değişikliğini birçok yerde tekrarlamamız gerekir. TypeScript olmadan bazı yanlış veri kullanımlarını ancak kullanıcı karşılaşınca fark edebiliriz.',
    try: 'Bir ürün aç, beden seçmeden sepete ekle. Arayüzün neden beden istediğini gör. Ardından beden seçip tekrar dene.',
  },
  {
    number: '02',
    title: 'Git: projenin değişiklik hafızası',
    what: 'Kaynak kodu Git ile takip ediyoruz. .gitignore; indirilen paketleri, geçici çıktıları ve .env gibi gizli ayar dosyalarını dışarıda tutar. Commit, bir değişiklik grubunun isimlendirilmiş kaydıdır.',
    why: 'Hangi satırın ne zaman ve neden değiştiğini görebilir, bozuk bir değişikliği önceki çalışır sürümle karşılaştırabiliriz. Branch, ana sürümü bozmadan çalıştığımız ayrı geliştirme çizgisidir.',
    without:
      'son-son-gercek-son klasörleri oluşur. Bir hata çıktığında değişikliğin kaynağını ve doğru eski sürümü bulmak zorlaşır. Git tek başına uzaktan yedek değildir.',
    try: 'Terminalde git status ile bekleyen değişiklikleri, git diff ile satır farklarını, git log --oneline ile kayıtlı sürümleri incele.',
  },
  {
    number: '03',
    title: 'GitHub ve pull request: kontrollü değişiklik',
    what: 'GitHub, Git deposunun uzaktaki kopyasını ve işbirliği araçlarını sağlar. Pull request şablonu neyin değiştiğini, nasıl test edildiğini ve geri dönüş planını sorar.',
    why: 'Önerilen akış: görev → codex/ isimli dal → küçük commit → pull request → otomatik kontroller → inceleme → main. GitHub hesabı ile canlı site sunucusu farklı şeylerdir.',
    without:
      'Kod bilgisayar kaybına karşı savunmasız kalabilir; herkes doğrudan ana dala değişiklik yaparsa çalışan sürümün bozulma ihtimali artar. Dal koruması ayrıca etkinleştirilmelidir; dosya eklemek tek başına bunu sağlamaz.',
    try: 'GitHub deposunda Code, Pull requests ve Actions sekmelerini karşılaştır. Code dosyaları, Pull requests önerileri, Actions otomatik kontrolleri gösterir.',
  },
  {
    number: '04',
    title: 'Paket kilidi: aynı girdilerle kurulum',
    what: 'package.json projenin ihtiyaçlarını, package-lock.json tam paket ağacını tutar. .nvmrc Node.js ana sürümünü belirtir. Temiz kurulum için npm ci kullanırız.',
    why: 'Bilgisayarınla CI sunucusunun aynı paket sürümlerini kullanmasını sağlarız. npm ci kilitle uyumsuz paket listesinde hata vererek farkı görünür kılar. İşletim sistemi ve Node yama sürümü de sonucu etkileyebileceği için bu mutlak yeniden üretilebilirlik garantisi değildir.',
    without:
      'Dün çalışan kod bugün farklı bir bağımlılık sürümüyle kurulabilir. Sorunun bizim değişikliğimizden mi yoksa dış paketten mi geldiğini ayırmak zorlaşır.',
    try: 'package.json içindeki scripts bölümünü incele. dev geliştirme sunucusu, build yayın derlemesi, typecheck tip kontrolü, test davranış kontrolüdür.',
  },
  {
    number: '05',
    title: 'CI: her değişiklikte otomatik kontrol',
    what: 'GitHub Actions için bir workflow hazırladık. Temiz kurulum, tip kontrolü, sepet testleri, bağımlılık denetimi, yayın derlemesi, HTTP kontrolü ve Docker kontrolünü sırayla çalıştırır.',
    why: 'CI, Continuous Integration demektir. Kodun birleştirilmeden önce ortak bir ortamda denetlenmesini sağlar. Test bozulunca hata görünür olur. Başarısız kontrolün birleştirmeyi engellemesi için dal koruması kuralı da gerekir.',
    without:
      'Her değişiklikte elle aynı kontrolleri yapmak zorunda kalırız ve bazılarını unuturuz. CI geçmişi olmadan hangi sürümün geçtiğini kanıtlamak zorlaşır.',
    try: 'Actions ekranında bir çalıştırmayı aç. Her adımın komutunu ve sonucunu incele. Kırmızı adım varsa yayınlamadan önce nedenini çöz.',
  },
  {
    number: '06',
    title: 'Docker: uygulamayı çalışacağı ortamla paketlemek',
    what: 'Çok aşamalı Dockerfile hazırlandı. İlk aşama paketleri kurar, ikinci aşama derler, son aşama yalnızca çalışması gereken dosyaları içerir. Uygulama root olmayan kullanıcıyla çalışır.',
    why: 'Container, uygulamanın taşınabilir çalışma paketidir. Geliştirme araçlarını çalışan sunucudan ayırırız. Healthcheck uygulamanın HTTP yanıtını izler; tüm işlevlerin doğru olduğunu tek başına kanıtlamaz.',
    without:
      'Sunucuda eksik paket veya farklı çalışma ortamı nedeniyle yalnızca yayında görünen hatalar yaşayabiliriz. Docker kullanmak tek başına güvenlik veya yedekleme sağlamaz.',
    try: 'Docker Desktop çalışırken docker compose up --build komutu ile paketi oluştur. Sonra http://127.0.0.1:3001 adresini aç. docker compose down ile bu deneme ortamını durdur.',
  },
  {
    number: '07',
    title: 'Frontend verisi güvenilir kaynak değildir',
    what: 'Sepet tarayıcıda yalnızca ürün kimliği, beden ve adet tutar. Bozuk kayıtları kontrol ederiz. Örnek toplamı katalogdan hesaplarız. Bu kayıtlar gerçek stok veya sipariş değildir.',
    why: 'Ziyaretçi kendi tarayıcısındaki verileri değiştirebilir. Canlı sistemde backend fiyatı, indirimi ve stok durumunu yeniden doğrulayacak; sipariş ve stok değişikliğini veritabanı işlemi içinde tutarlı kaydedecek.',
    without:
      'Tarayıcının söylediği fiyat veya ödeme sonucuna güvenirsek yanlış tutarlı siparişler ve stok tutarsızlığı oluşabilir. Tarayıcı depolamasına parola, kart veya gizli anahtar konmamalıdır.',
    try: 'Sepete bir ürün ekle ve sayfayı yenile: örnek sepet korunur. Başka cihazda görünmez; çünkü henüz sunucu hesabına bağlı değildir.',
  },
  {
    number: '08',
    title: 'Veritabanı DevOps’u: sıradaki uygulamalar',
    what: 'Backend aşamasında PostgreSQL şemasını migration dosyalarıyla sürümleyeceğiz. Migration, bir veritabanı yapısının kontrollü değişiklik tarifidir. Seed dosyaları yalnızca test için sahte ürün ve kullanıcı üretir.',
    why: 'CI içinde sıfırdan veritabanı kurup migration zincirini test edeceğiz. Ayrı geliştirme, test ve canlı veritabanları kullanacağız. Canlı müşteri verisini test ortamına kopyalamayacağız.',
    without:
      'Elle değiştirilen tablolar ortamlar arasında farklılaşır. Kod yeni sütun beklerken veritabanında o sütun olmayabilir. Kontrolsüz migration veri kaybına yol açabilir.',
    try: 'Henüz veritabanı kurulmadı. Bu aşamada şu akışı öğren: migration yaz → boş veritabanında dene → eski sürümden yükseltmeyi dene → test ortamında doğrula → kontrollü canlı geçiş.',
  },
  {
    number: '09',
    title: 'Yedek, geri dönüş ve izleme',
    what: 'Veri aşamasında otomatik yedekler, erişim sınırları, saklama süresi ve ayrı ortamda geri yükleme denemesi ekleyeceğiz. Hata, gecikme ve başarısız ödeme bildirimlerini izleyeceğiz.',
    why: 'Yedek alındı mesajı yetmez; verinin geri getirilebildiğini denemek gerekir. RPO kabul edilebilir veri kaybı süresidir; RTO toparlanma süresidir. Bu hedefleri mağazanın ihtiyacına göre belirleyeceğiz.',
    without:
      'Disk veya insan hatasında sipariş verisi kaybolabilir; çalışan yedek olmadığını kriz anında öğrenebiliriz. İzleme olmazsa arızayı önce müşteriler fark eder.',
    try: 'İleride test veritabanına bir kayıt ekleyip yedek alacağız, ayrı bir veritabanına geri yükleyip kaydı doğrulayacağız. İlk denemeyi asla canlı veride yapmayacağız.',
  },
  {
    number: '10',
    title: 'Gerçek ödeme ve canlıya çıkış kapısı',
    what: 'Şu anda ödeme veya backend yok. İleride ödeme sağlayıcısının test ortamında başarılı, başarısız ve yinelenen bildirim senaryolarını deneyeceğiz. Kart verisini kendi veritabanımıza almayacağız.',
    why: 'Tarayıcının başarılı sayfaya yönlenmesi ödeme kanıtı değildir. Backend doğrulanmış ödeme bildirimini işleyecek. Idempotency, aynı işlem tekrar geldiğinde ikinci sipariş veya tahsilat oluşturmamaktır.',
    without:
      'İki kez gelen bildirim çift sipariş yaratabilir; başarısız işlem başarılı sayılabilir. Kod sürümünü geri almak veritabanı değişikliğini otomatik geri almaz; ikisinin geri dönüşü ayrı planlanmalıdır.',
    try: 'Canlıya çıkmadan önce gerçek ürün bilgileri, sözleşmeler, yetkilendirme, güvenlik kontrolleri, ödeme/iade testleri, geri yükleme provası ve operasyon sorumluları tamamlanacak.',
  },
];
export default function Learning() {
  return (
    <main className="learning">
      <Link href="/" className="text-link">
        ← Mağazaya dön
      </Link>
      <p className="eyebrow">MOS’SO / BİRLİKTE GELİŞTİRİYORUZ</p>
      <h1>
        Bir mağazanın
        <br />
        <em>arkasındaki sistem.</em>
      </h1>
      <p className="learning-intro">
        Sadece sonuç değil, her kararın nedeni. Bu rehber frontend’den güvenli satış altyapısına
        kadar projemizi adım adım anlatıyor.
      </p>
      <div className="learning-status">
        <strong>Şu an: frontend geliştirme</strong>
        <span>
          Gerçek sipariş, ödeme, veritabanı ve canlı yayın henüz yok. CI ve Docker dosyalarının
          hazırlanması, çalıştırıldıklarının kanıtı değildir; doğrulama durumu proje README
          dosyasında tutulur.
        </span>
      </div>
      <nav aria-label="Dersler" className="lesson-nav">
        {lessons.map((l) => (
          <a key={l.number} href={`#ders-${l.number}`}>
            {l.number} · {l.title}
          </a>
        ))}
      </nav>
      {lessons.map((l) => (
        <article className="lesson" id={`ders-${l.number}`} key={l.number}>
          <span className="lesson-number">{l.number}</span>
          <h2>{l.title}</h2>
          <h3>Ne yaptık / ne yapacağız?</h3>
          <p>{l.what}</p>
          <h3>Neden?</h3>
          <p>{l.why}</p>
          <h3>Yapmasaydık ne olurdu?</h3>
          <p>{l.without}</p>
          <div className="lesson-exercise">
            <strong>Sen dene</strong>
            <p>{l.try}</p>
          </div>
        </article>
      ))}
      <p className="learning-end">
        Bir sonraki derste dosyaları birlikte açıp bir değişikliğin GitHub üzerinden nasıl kontrol
        edildiğini takip edeceğiz.
      </p>
      <Link href="/" className="primary">
        Mağazayı gez →
      </Link>
    </main>
  );
}
