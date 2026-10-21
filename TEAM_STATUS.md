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

### 2026-10-21 14:45 — bonartd (Claude Code)
- **Durum:** Tamamlandı (Apps Script'in yeni sürümü kullanıcı tarafından dağıtılacak)
- **Dokunulan dosyalar:** `app/assets/js/pages/anket.js`, `app/assets/js/config.js`, `app/assets/css/app.css`, `app/sw.js`, `tools/google-apps-script/anket.gs`, `docs/ANKET_KURULUM.md`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Aynı kişinin tekrar yanıtını zorlaştırmak için (kullanıcı kararı: kiosk içi çözüm): **"Ad" alanı kaldırıldı**, anket anonim. Görüş kutusunun altına isteğe bağlı **bölüm seçimi** (Radyo, Televizyon ve Sinema · Görsel İletişim Tasarımı · Yeni Medya ve İletişim · Halkla İlişkiler ve Reklamcılık · Çizgi Film ve Animasyon · Diğer → yazma alanı; `Diğer: …` olarak kaydedilir). **60 sn kuralı** (`config.surveyCooldownSec`): gönderimden sonra teşekkür ekranı geri sayımla kalır; yüz tıklaması, hareketsizlik sıfırlaması ve sayfa yeniden yüklemesi beklemeyi atlatmaz (son gönderim zamanı `localStorage`'da). Betik: sütunlar `Tarih, Saat, Bölüm, Puan, Memnuniyet, Görüş, Kayıt ID, Alınma zamanı, Not`; başlık satırı farklıysa otomatik güncellenir; 10 dk'da en fazla 60 kayıt (CacheService) — sınırda `limit` döner, iPad kaydı kuyrukta tutar; iPad saatine göre önceki yanıta 55 sn'den yakın kayıt `Not` sütununda "şüpheli". `sw.js` → `ocinfo-v5`. AGENTS.md 3.6 ve kurulum rehberi (betik güncelleme adımları dahil) güncellendi.
- **Doğrulama (tarayıcı, sahte uç noktayla):** "Diğer: Müzik" gönderimi, `ad` alanının gitmemesi, geri sayım, bekleme sırasında yüz tıklaması/hareketsizlik/yeniden yüklemenin teşekkür ekranında kalması, süre bitince soru ekranına dönüş, `limit` yanıtında kuyruğun korunup sonra boşalması. Yeni betik gerçek Apps Script'te **henüz çalışmıyor**.
- **Sıradaki adım:** Kullanıcı yeni `anket.gs`'yi yapıştırıp `kurulumTesti`'ni çalıştıracak ve **Dağıtımları yönet → Yeni sürüm** ile dağıtacak (URL aynı kalır). Sonra canlı gönderim kontrolü. Tablodaki eski TEST satırları silinebilir.
- **Commit:** `797f200`

### 2026-10-21 15:00 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `TEAM_STATUS.md`
- **Yapılan iş:** Kullanıcı yeni `anket.gs`'yi Apps Script'e yapıştırıp **sürüm 2** olarak dağıttı (web uygulaması adresi değişmedi). Canlı uç noktaya iki deneme satırı gönderildi; kullanıcı tabloda doğruladı: başlıkta **Bölüm** ve **Not** sütunları var, bölüm değerleri yazılıyor, 5 sn arayla gelen ikinci satırda "şüpheli" notu var. Anket sayfası (Sayfa 2) uçtan uca çalışır durumda.
- **Not:** Tabloda "TEST … (silinebilir)" deneme satırları var; kullanıcı silecek.
- **Sıradaki adım:** iPad'de canlı deneme. Betik ileride değişirse güncellemeyi kolaylaştırmak için `clasp` kurulumu düşünülebilir (Node.js gerekir; kullanıcı onayı alınmadı). Sonra Sayfa 3 (en çok kullanılan ekipmanlar) — veri kaynağı belirlenmeli.
- **Commit:** `da6f74a`

### 2026-10-21 15:15 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/img/logo-yasar.png` (yeni), `app/index.html`, `app/assets/css/app.css`, `app/sw.js`, `TEAM_STATUS.md`
- **Yapılan iş:** Üst çubuktaki beyaz kutudaki "OC" yazısı yerine kullanıcının verdiği **Yaşar Üniversitesi 25. yıl logosu** konuldu. Logo beyaz kenar boşluklarından kırpılıp (%2 pay) 192×192 kare PNG yapıldı; kutu boyutu (48 px) aynı, logo 3 px iç boşlukla ortalı, `object-fit: contain` ile kesilmeden sığıyor. `sw.js` → `ocinfo-v6`, logo önbellek listesine eklendi. Ana ekran ikonları (icon-180/192/512) değişmedi — hâlâ geçici "OC info".
- **Sıradaki adım:** İstenirse ana ekran ikonları da logoyla yapılabilir. Sonra Sayfa 3.
- **Commit:** `a02561b`

### 2026-10-21 15:25 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/img/icon-180.png`, `app/assets/img/icon-192.png`, `app/assets/img/icon-512.png`, `app/sw.js`, `TEAM_STATUS.md`
- **Yapılan iş:** Geçici "OC info" ana ekran ikonları, Yaşar Üniversitesi 25. yıl logosuyla değiştirildi: beyaz opak zemin, logo ortalı, iOS köşe yuvarlaması için logo çevresinde ~%13 boşluk (orijinal görselden 180/192/512 px). `sw.js` → `ocinfo-v7`.
- **Not:** iOS ana ekran ikonu eklenirken kaydedilir; iPad'de yeni ikon için ana ekrandaki OCinfo kaldırılıp Safari'den yeniden "Ana Ekrana Ekle" yapılmalı.
- **Sıradaki adım:** Sayfa 3 (en çok kullanılan ekipmanlar) — veri kaynağı belirlenmeli.
- **Commit:** `e726277`

### 2026-10-21 16:00 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/js/pages/istatistik.js` (yeni), `app/data/istatistik.json` (yeni), `tools/veri/istatistik_olustur.py` (yeni), `app/assets/js/app.js`, `app/assets/css/app.css`, `app/sw.js`, `.gitignore`, `AGENTS.md`, `README.md`, `TEAM_STATUS.md`
- **Yapılan iş:** **Sayfa 3 — Kullanım istatistikleri.** Kaynak: kullanıcının verdiği "2025-2026 Eğitim Yılına Ait Ödünç Cihaz Ofisi Verileri.xlsx" (1.199 rezervasyon, 238 kullanıcı, 1 Eylül 2025–30 Eylül 2026). Excel **depoya eklenmedi** (ad soyad içerir); `tools/veri/istatistik_olustur.py` yalnızca anonim sayım küpü üretir (bölüm, sınıf, ay, gün bazında rezervasyon; bölüm-sınıf ve bölüm-sınıf-ay bazında farklı kullanıcı). 5 kişiden az kullanıcılı birimler (Film Tasarımı, Endüstriyel Tasarım, Radyo Program Yapımcısı, Belirtilmemiş) "Diğer"de; Medya Merkezi Müdürlüğü "Medya Merkezi (personel)" olarak ayrı. Sınıf "0" = "Sınıf bilgisi yok / personel". Sayfa: 4 özet kutusu (rezervasyon, farklı kullanıcı, en yoğun ay, en çok kullanan bölüm — personel ve Diğer hariç), kullanıcının seçtiği grafik (Bölüm / Sınıf / Aylar / Haftanın günü), kitle filtresi (Tüm kullanıcılar / Yalnızca öğrenciler = 1–4. sınıf, personel hariç), ölçü (Rezervasyon / Kişi; gün grafiğinde gizli). Kütüphanesiz SVG çubuklar, tek seri tek renk, en yüksek çubuk koyu; çubuğa dokununca ayrıntı ve pay. Hareketsizlikte varsayılan grafiğe döner; yön değişince yeniden çizilir. Sayfa rotasyonda 40 sn. `sw.js` → `ocinfo-v8`.
- **Doğrulama:** Sayımlar Excel'deki "Bölüm Özeti" ile birebir (ör. RTS 276, YMİ 263, toplam 1.199/238). Tarayıcıda tüm görünüm/filtre kombinasyonları, dokunma ayrıntısı, hareketsizlik sıfırlaması; 1080×810, 1024×768, 810×1080'de taşma yok.
- **Not:** Excel'de cihaz/ekipman sütunu yok; "en çok kullanılan ekipman" bu veriyle yapılamaz. Ödünç süresi (iade − rezervasyon) verisi var ama gösterilmedi (çoğu kayıt 3 gün kuralını aşıyor görünüyor; ofisle yorumlanmalı).
- **Sıradaki adım:** Sayfa 4 için ekipman bazlı veri iste. Veri güncellenince AGENTS.md 3.6'daki komutla JSON'u yeniden üret.
- **Commit:** `ef27b1d`

### 2026-10-21 16:10 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/sw.js`, `TEAM_STATUS.md`
- **Yapılan iş:** Service Worker kurulumunda kabuk dosyaları artık `cache: 'reload'` ile sunucudan taze alınıyor; önceden `cache.addAll` tarayıcının HTTP önbelleğinden (GitHub Pages 10 dk) eski kopya alıp yeni sürüm önbelleğine kalıcı yazabilirdi. `ocinfo-v9`. Canlıda Sayfa 3 dosyalarının önbellekte doğru olduğu doğrulandı.
- **Sıradaki adım:** Sayfa 4 için ekipman bazlı veri.
- **Commit:** `1140d80`

### 2026-10-21 16:50 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/js/pages/anket.js`, `app/assets/js/pages/istatistik.js`, `app/data/istatistik.json`, `tools/veri/istatistik_olustur.py`, `app/assets/css/app.css`, `app/sw.js`, `AGENTS.md`, `README.md`, `docs/ANKET_KURULUM.md`, `TEAM_STATUS.md`
- **Yapılan iş:** **Anket:** gizlilik metni yalnızca "Yanıtlar anonimdir."; **bölüm zorunlu** (seçilmeden "Gönder" pasif, altında "Göndermek için bölümünü seç."; "Diğer"de ad yazılmadan pasif); seçeneklere **Endüstriyel Tasarım** eklendi. **Sayfa 3:** başlık "Ödünç Cihaz Sistemi Kullanım Bilgileri", tarih alt satırı kaldırıldı; yalnızca rezervasyon (kişi ölçüsü ve kitle filtresi kaldırıldı); **Medya Merkezi verisi ve 31 Ağustos 2026 sonrası** dahil değil (850 rezervasyon). Yeni görünümler: **Teslim alma günü** (rezervasyon başlangıç tarihine göre; notla belirtildi) ve **İade günü**. Özet kutuları: rezervasyon, en yoğun ay, en yoğun iade günü, en çok kullanan bölüm. **Çok yıllı hazırlık:** JSON eğitim yılı bazında (`yillar`); betik birden çok Excel alır, yalnızca tamamlanmış yılları yazar, verilen yılları yeniler/diğerlerini korur, sütunları başlık adından bulur (sıra ve ad varyasyonları), bölüm yazımlarını birleştirir, Türkçe büyük/küçük harfe dikkat eder; tarihte saat varsa teslim alma/iade **saati** grafikleri, birden çok yıl varsa **yıl seçimi** ve **Yıllar** grafiği kendiliğinden açılır. `sw.js` → `ocinfo-v10`.
- **Değerlendirme:** Excel'de **saat bilgisi yok** (2.398 tarih değerinin tümü yalnızca gün) → yoğun saat analizi bu veriyle yapılamaz. Gün bazında anlamlı: iadelerin %45'i pazartesi (380/850), hafta sonu iade yok; teslim alma (rezervasyon başlangıcı) da en çok pazartesi (212), ancak 111 rezervasyon hafta sonu başlıyor.
- **Doğrulama:** Anket zorunluluk mantığı ve "Endüstriyel Tasarım" gönderimi (sahte uç nokta). Sayfa 3 tüm görünümleri gerçek veriyle; çok yıllı/saatli yapı **sahte (kişisel veri içermeyen) 2024-2025 dosyasıyla** denendi (farklı başlık sırası/adları, saatli tarihler, yazım farklılıkları) ve ardından gerçek JSON geri yüklendi. 1080×810, 1024×768, 810×1080'de taşma yok. Geçici Excel kopyaları silindi.
- **Sıradaki adım:** Kullanıcı önceki yılların Excel'lerini iletince betiğe verip JSON'u yenile. Saatli veri mümkünse ofisten iste.
- **Commit:** `19b8db0`

### 2026-10-21 17:20 — bonartd (Claude Code)
- **Durum:** Tamamlandı
- **Dokunulan dosyalar:** `app/assets/js/pages/istatistik.js`, `app/data/istatistik.json`, `tools/veri/istatistik_olustur.py`, `app/assets/css/app.css`, `app/sw.js`, `AGENTS.md`, `TEAM_STATUS.md`
- **Yapılan iş:** Sayfa 3 düzenlemeleri (kullanıcı isteği): kaynak satırı yalnızca "Kaynak: Ödünç Cihaz Ofisi rezervasyon kayıtları."; özet kutusu "Rezervasyon sayısı"; **sınıf bilgisi "0" olan kayıtlar** betikte tamamen çıkarıldı (Medya Merkezi zaten hariç) → 845 rezervasyon; sınıf grafiğinde yalnızca 1–4. **Teslim alma / iade günü** artık çubuk değil **ısı haritası**: satır Pazartesi–Cuma (hafta sonu yok), sütun ay, hücrede sayı yok; tek ton 5 düzey (Çok sakin → Çok yoğun), "Sakin → Yoğun" göstergesi, dokununca "Pazartesi · Aralık 2025 — Çok yoğun". Çubuklar genişletildi (dikey en fazla 110 px / bandın %80'i, yatay 48 px). Dar ekranda ısı haritası ay etiketleri yıl olmadan. `ocinfo-v11`.
- **Doğrulama:** Tüm görünümler 1080×810, 1024×768, 810×1080'de taşmasız; ısı haritasında `.val` (sayı) yok; dokunma metni doğru. Excel geçici kopyası JSON üretildikten sonra silindi.
- **Sıradaki adım:** Önceki yılların Excel'leri gelince betiğe ver.
- **Commit:** (doldurulacak)
