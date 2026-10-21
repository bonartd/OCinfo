# TEAM_STATUS.md — OCinfo Ortak Çalışma Defteri

> **Bu dosya ekibin ortak hafızasıdır.** İşe başlamadan önce baştan sona oku,
> iş bitince en alta kayıt ekle. Kurallar: [`AGENTS.md`](AGENTS.md).
>
> - "Aktif Çalışma": işe başlarken satır **ekle**, iş bitince **sil**.
> - "Kayıt Defteri": **append-only** — en yeni kayıt **EN ALTTA**. Eski kayıtlar asla
>   silinmez veya değiştirilmez (tek istisna: kendi kaydına sonradan commit hash'i yazmak).
> - Başkasının adına kayıtlı dosyaya dokunma.

---

## Aktif Çalışma

| Kim | Araç | Dosyalar | Başlangıç (YYYY-AA-GG SS:DD) |
|-----|------|----------|------------------------------|
| _(şu an aktif çalışma yok)_ | | | |

---

## Kayıt Şablonu

Aşağıdaki bloğu kopyalayıp **Kayıt Defteri'nin en altına** yapıştır ve doldur:

```markdown
### YYYY-AA-GG SS:DD — Ad Soyad (Araç adı)
- **Durum:** Tamamlandı | Devam ediyor | Bloke
- **Dokunulan dosyalar:** `yol/dosya1`, `yol/dosya2`
- **Yapılan iş:** Kısa ve net açıklama.
- **Sıradaki adım:** Bir sonraki kişinin / oturumun yapması gereken.
- **Commit:** `abc1234`
```

---

## Kayıt Defteri

<!-- Yeni kayıtları BU SATIRIN ALTINA, dosyanın en sonuna ekleyin. Eski kayıtları silmeyin. -->

### 2026-10-21 10:15 — bonartd (Claude Code)
- **Durum:** Tamamlandı (yayın adımı **Bloke**)
- **Dokunulan dosyalar:** `AGENTS.md`, `TEAM_STATUS.md`, `README.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.github/workflows/pages.yml`, `.gitignore`, `docs/EKIP_KURULUM.md`, `app/index.html`, `app/assets/{css,js,img}/.gitkeep`, `app/data/.gitkeep`
- **Yapılan iş:** Ekip çalışma altyapısı kuruldu: bağlayıcı kurallar (AGENTS.md, iPadOS 15.5 PWA/kiosk teknik kuralları dahil), ortak defter, araç köprüleri (Claude Code, Cursor, Copilot), README, ekip kurulum rehberi ve hazır prompt. Teknoloji kararı: saf HTML/CSS/JS, derleme adımı yok; `app/` klasörü GitHub Actions ile Pages'e yayınlanacak. Özel depo `bonartd/OCinfo` oluşturuldu ve push edildi. Uygulamanın kendisi **geliştirilmedi**.
- **Yer tutucu içerik:** `app/index.html` yalnızca "hazırlanıyor" sayfasıdır (manifest, Service Worker, ikon yok). `app/assets/*` ve `app/data/` boş klasörlerdir (`.gitkeep`). AGENTS.md'de adı geçen `config.js`, `sw.js`, `manifest.webmanifest` henüz yok. Hareketsizlik süresi (90 sn) varsayılan öneridir. Anket yanıtlarının gönderileceği servis kararlaştırılmadı.
- **Bloke:** GitHub Pages açılamadı — hesabın ücretsiz planı özel depolarda Pages'i desteklemiyor (HTTP 422). Çözüm seçenekleri: (1) GitHub Education (yasar.edu.tr adresiyle Teacher/Student → ücretsiz Pro) veya GitHub Pro; (2) depoyu public yapmak. Seçimden sonra: Ayarlar → Pages → Source: **GitHub Actions**, ardından Actions'tan iş akışını yeniden çalıştır. İlk iş akışı çalışması bu yüzden başarısız olabilir.
- **Sıradaki adım:** Pages engelini çöz; collaborator'ı ekle (Settings → Collaborators); PWA kabuğu (manifest, iOS meta, sw.js, hareketsizlik zamanlayıcısı, ana sayfa iskeleti) ve `app/data/` JSON şemalarını tasarla; anket verisinin nereye gideceğine karar ver; ikon/görsel varlıkları topla.
- **Commit:** `76ad5df`

### 2026-10-21 10:25 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `README.md`, `AGENTS.md`, `docs/EKIP_KURULUM.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Önceki kayıttaki Pages engeli çözüldü: depo sahibinin kararıyla depo **public** yapıldı, GitHub Pages (Source: GitHub Actions) açıldı, yayın iş akışı başarıyla çalıştı. Canlı adres https://bonartd.github.io/OCinfo/ doğrulandı (HTTP 200, yer tutucu sayfa). Belgelerdeki "özel depo" ve "henüz aktif değil" ifadeleri güncellendi; AGENTS.md'ye deponun herkese açık olduğu uyarısı eklendi.
- **Sıradaki adım:** Collaborator'ı ekle (push yetkisi için gerekli); PWA kabuğu (manifest, iOS meta, sw.js, hareketsizlik zamanlayıcısı, ana sayfa iskeleti) ve `app/data/` JSON şemalarını tasarla; anket verisinin nereye gideceğine karar ver.
- **Commit:** `bd5e526`

### 2026-10-21 10:50 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `docs/OFIS_KURALLARI.md` (yeni), `README.md`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Ofisin resmî sitesi (https://odunccihaz.yasar.edu.tr/, YAŞAR ID girişli rezervasyon sistemi) belgelere eklendi. Sitedeki 10 ödünç alma kuralı `docs/OFIS_KURALLARI.md`'ye kaynak ve tarihle alındı; öğrenci için kart özeti taslağı, belirsizlikler (3 gün sınırı ile günlük talep ilişkisi, iade saatinin hangi gün olduğu, proje sorumlusunun kim olduğu, 1 dönem engelin kapsamı), sitede olmayan bilgiler (yer, saatler, iletişim, iptal, hasar/kayıp, cihaz listesi) ve yazım düzeltmeleri yazıldı. AGENTS.md 3.6'ya kural eklendi: rezervasyon sitesi kiosk'a gömülmez, QR kodla yönlendirilir.
- **Sıradaki adım:** `docs/OFIS_KURALLARI.md` Bölüm 3'teki soruları Ödünç Cihaz Ofisi / Bilgi İşlem ile netleştir; ofis yeri, saatleri, iletişim ve cihaz listesini topla.
- **Commit:** `8efa8dc`

### 2026-10-21 11:30 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/index.html`, `app/manifest.webmanifest`, `app/sw.js`, `app/assets/css/app.css`, `app/assets/js/{config,app,idle,rotator}.js`, `app/assets/js/pages/rezervasyon.js`, `app/data/kurallar.json`, `app/assets/img/{qr-odunccihaz.svg,icon-180.png,icon-192.png,icon-512.png}`, `AGENTS.md`, `README.md`, `TEAM_STATUS.md` (`.gitkeep` dosyaları silindi)
- **Yapılan iş:** Kiosk kabuğu kuruldu: iOS meta etiketli PWA, Service Worker (`ocinfo-v1`; kabuk önce önbellekten, JSON önce ağdan), üst çubukta saat/tarih ve çevrimdışı rozeti, otomatik dönen sayfa altyapısı (dokunulunca durur, 90 sn hareketsizlikte ilk sayfaya döner; nokta ve kaydırma ile geçiş), arka plandan dönüşte başa dönme, gece 04:00'te sessiz yenileme. **Sayfa 1:** rezervasyon sitesine giden statik QR (SVG, segno ile bir kez üretildi; çalışma zamanı bağımlılığı yok) + 3 adımlı yönlendirme + 10 kural kartı (`data/kurallar.json`, Kural 7 kırmızı vurgulu). Doğrulama: 1024×768, 1080×810, 1180×820 yatay ve 810×1080 dikeyde taşma yok; QR'ın `https://odunccihaz.yasar.edu.tr/` okuduğu, döndürücü ve hareketsizlik zamanlayıcısı tarayıcıda test edildi.
- **Doğrulanamayan:** Service Worker / çevrimdışı çalışma bu ortamın tarayıcısında test edilemedi (önizleme tarayıcısı SW kaydını engelliyor); gerçek iPad'de denenmeli. Gerçek iPad'de ana ekrana ekleme ve Güdümlü Erişim de henüz denenmedi.
- **Yer tutucu:** İkonlar geçici "OC info" ikonu. Kural kartlarındaki kısa metinler sadeleştirmedir; asıl metin JSON'daki `orijinal` alanında.
- **Sıradaki adım:** iPad'de canlı adresten test (ana ekrana ekle, uçak modunda aç). Sonra Sayfa 2 (memnuniyet anketi + görüş/öneri) — önce anket yanıtlarının nereye gönderileceğine karar verilmeli.
- **Commit:** `58291e9`

### 2026-10-21 12:05 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/css/app.css`, `app/sw.js`, `TEAM_STATUS.md`
- **Yapılan iş:** Kullanıcı isteğiyle Sayfa 1'deki kurallar iki sütunlu kartlardan **tek sütunlu, ince çizgilerle ayrılmış sade listeye** çevrildi ("Başlık — açıklama" aynı satırda, küçük yuvarlak numara). Kural 7 kutu yerine kırmızı numara ve kırmızı metinle vurgulanıyor. Yalnızca CSS değişti (HTML/JSON aynı). `sw.js` önbellek sürümü `ocinfo-v2` yapıldı. 1024×768, 1080×810 ve 810×1080'de taşma olmadığı doğrulandı.
- **Sıradaki adım:** iPad'de canlı test; Sayfa 2 (memnuniyet anketi) için yanıtların gideceği yer kararı.
- **Commit:** `0b23e92`

### 2026-10-21 12:50 — bonartd (Claude Code)
- **Durum:** Tamamlandı (deneme sürümü; Drive bağlantısı **kurulmadı**)
- **Dokunulan dosyalar:** `app/assets/js/pages/anket.js` (yeni), `app/assets/js/{app,config,rotator}.js`, `app/index.html`, `app/assets/css/app.css`, `app/sw.js`, `tools/google-apps-script/anket.gs` (yeni), `docs/ANKET_KURULUM.md` (yeni), `AGENTS.md`, `README.md`, `TEAM_STATUS.md`
- **Yapılan iş:** **Sayfa 2 — memnuniyet anketi:** "Ödünç Cihaz Ofisi'nin hizmetlerinden memnun musun?" sorusu, 5 gülen yüz (Hiç memnun değilim → Çok memnunum). Yüze dokununca isteğe bağlı görüş/öneri + ad formu, Gönder → 6 sn teşekkür ekranı → başa dönüş. Yanıtlar (tarih, saat, ad, puan, memnuniyet, görüş, id) önce iPad'de `localStorage` kuyruğuna yazılır, `config.surveyEndpoint`'e (Google Apps Script) gönderilir; bağlantı yoksa bekler, `online` olayında ve 60 sn'de bir tekrar denenir; betik id ile tekrarları ayıklar. Apps Script betiği "Yanıtlar" sayfasına başlıklı satır ekler, girdiyi doğrular, formül enjeksiyonunu engeller. Altyapı: sayfalar `reset()` sağlayabilir (hareketsizlikte çağrılır); sayfa noktaları üst çubuğa taşındı; form alanlarında kaydırma ile sayfa değişmez. `sw.js` → `ocinfo-v3`. AGENTS.md 3.6 güncellendi: ad ve görüş isteğe bağlı (önceki "anonim" kuralı kullanıcı isteğiyle değişti).
- **Doğrulama:** Tarayıcıda yüz → form → gönder → teşekkür → 6 sn sonra sıfırlama; kuyruğa doğru kayıt; sahte uç noktayla hata durumunda bekleme, `online` ile gönderip kuyruğu boşaltma; hareketsizlikte formun temizlenip Sayfa 1'e dönmesi; 1080×810, 1024×768, 810×1080 düzenleri. Gerçek Apps Script ile ve iPad klavyesiyle **test edilmedi**.
- **Yer tutucu:** `config.surveyEndpoint` boş (yanıtlar iPad'de birikir). Ekrandaki gizlilik/KVKK metni yer tutucu.
- **Sıradaki adım:** `docs/ANKET_KURULUM.md`'ye göre Drive'da e-tabloyu ve Apps Script dağıtımını kur, URL'yi `config.surveyEndpoint`'e yaz; iPad'de gerçek gönderimi dene. KVKK metnini kurumla teyit et.
- **Commit:** `987719b`

### 2026-10-21 13:10 — bonartd (Claude Code)
- **Durum:** Tamamlandı (Apps Script dağıtımı kullanıcıda bekliyor)
- **Dokunulan dosyalar:** `tools/google-apps-script/anket.gs`, `docs/ANKET_KURULUM.md`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Kullanıcı anket yanıtları için ortak "Mega Tablo - 2026" e-tablosundaki boş **"OCinfo"** sayfasını belirledi. Tablo birçok başka projenin sayfasını içerdiği için betik **bağımsız Apps Script projesi** olarak yeniden düzenlendi: `openById` + yalnızca `OCinfo` sayfası (sayfa yoksa yeni sayfa açmaz, hata verir); tablo kimliği depo herkese açık olduğu için betiğin `SPREADSHEET_ID` komut dosyası özelliğinde tutulur. `kurulumTesti()` (izin + başlık satırı) ve tabloya erişimi doğrulayan `doGet` eklendi. Kurulum rehberi buna göre yeniden yazıldı. Uygulama koduna dokunulmadı.
- **Sıradaki adım:** Kullanıcı `docs/ANKET_KURULUM.md` adımlarıyla betiği dağıtıp Web uygulaması URL'sini verecek → `app/assets/js/config.js` `surveyEndpoint`'e yazılacak, `sw.js` sürümü artırılacak ve gerçek gönderim denenecek.
- **Commit:** `0caaa86`

### 2026-10-21 13:35 — bonartd (Claude Code)
- **Durum:** Tamamlandı (Apps Script dağıtımı kullanıcıda bekliyor)
- **Dokunulan dosyalar:** `tools/google-apps-script/anket.gs`, `tools/google-apps-script/appsscript.json` (yeni), `docs/ANKET_KURULUM.md`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Güvenlik değerlendirmesi sonrası kullanıcı kararıyla anket yanıtları ortak "Mega Tablo - 2026" yerine **yalnızca anket için açılmış ayrı bir e-tabloya** yazılacak (adresi depoya yazılmadı; kullanıcıda). Betik tabloya **bağlı** hâle getirildi ve `appsscript.json` ile izni `spreadsheets.currentonly`'ye daraltıldı (hesaptaki diğer tablolara erişemez). "Yanıtlar" sayfası yoksa boş ilk sayfa yeniden adlandırılır. `doGet` artık tablo bilgisi döndürmüyor; `doPost` hata ayrıntısı sızdırmıyor. Önceki kayıttaki `SPREADSHEET_ID` / `openById` yaklaşımı kaldırıldı. Rehber ve AGENTS.md 3.6 güncellendi.
- **Sıradaki adım:** Kullanıcı rehberdeki 7 adımla betiği anket tablosuna kurup Web uygulaması URL'sini verecek → `config.surveyEndpoint` + `sw.js` sürümü → gerçek gönderim testi.
- **Commit:** `d319e92`

### 2026-10-21 14:25 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/js/config.js`, `app/sw.js`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Kullanıcı, anket tablosuna bağlı Apps Script'i (odunccihaz@gmail.com hesabı, `spreadsheets.currentonly` izni) kurup Web uygulaması olarak dağıttı; adres `config.surveyEndpoint`'e yazıldı. `sw.js` → `ocinfo-v4`. Doğrulama: `doGet` yanıt veriyor; POST ile satır yazılıyor; aynı id ikinci kez yazılmıyor (`duplicate`); geçersiz puan reddediliyor; tarayıcıdan `text/plain` POST'ta CORS sorunu yok, yanıt okunabiliyor. AGENTS.md sayfa tablosunda Sayfa 2 "Hazır".
- **Not:** Testler sırasında tabloya "TEST … (silinebilir)" adlı deneme satırları yazıldı; kullanıcı silebilir.
- **Sıradaki adım:** iPad'de canlı adresle uçtan uca dene (çevrimdışı yanıtın bağlantı gelince gitmesi dahil). KVKK aydınlatma metnini kurumla teyit et. Sonra Sayfa 3 (en çok kullanılan ekipmanlar) — veri kaynağı belirlenmeli.
- **Commit:** `f155bce`
