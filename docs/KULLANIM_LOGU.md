# Kullanım Logu

> **Durum: UYGULANDI** (`ocinfo-v16`, kullanıcı onayıyla). Uygulama tarafı: `app/assets/js/log.js`;
> kayıt tarafı: `tools/google-apps-script/anket.gs` (`tur: "log"`). Betiğin yeni sürümü Apps
> Script'te dağıtılana kadar olaylar iPad'de bekler, kaybolmaz.
>
> **Örnek (sentetik) dosya:** [`docs/ornekler/OCinfo_kullanim_logu_ORNEK_sentetik.xlsx`](ornekler/OCinfo_kullanim_logu_ORNEK_sentetik.xlsx)
> — `tools/veri/ornek_log_olustur.py` ile üretilir; gerçek veri değildir.

## 1. Amaç

Kiosk'un ne kadar ve nasıl kullanıldığını görmek:

- Günde kaç kişi ekrana dokunuyor, ne kadar kalıyor, hangi saatler yoğun?
- Hangi sayfa ve hangi grafik daha çok ilgi görüyor?
- Anketi başlatıp yarıda bırakan oranı nedir?
- Kiosk gün boyu çalışıyor mu, internet kesiliyor mu?

## 2. Neler kaydedilir?

Yalnızca **etkileşimler** ve birkaç **sistem olayı**. Kiosk boştayken 30 sn'de bir yapılan
otomatik sayfa geçişleri **kaydedilmez** (günde binlerce anlamsız satır olurdu).

| Olay | Ne zaman | Ayrıntı sütununda |
|---|---|---|
| Oturum başladı | Kiosk boştayken biri ekrana dokunur | "İlk dokunma" |
| Sayfa değişti | Kullanıcı noktalarla / kaydırarak sayfa değiştirir | `1 · Kurallar → 2 · Anket (nokta)` |
| Grafik seçildi | Sayfa 3'te açılır menüden seçim | `Aylara göre` |
| Yıl seçildi | Sayfa 3'te yıl seçimi (birden çok yıl varken) | `2024-2025` |
| Çubuk seçildi | Sayfa 3'te bir çubuğa dokunma | `Nisan 2026` |
| Anket: puan seçildi | Yüzlerden birine dokunma | `4 · Memnunum` |
| Anket gönderildi | Yanıt gönderilir | Anket tablosundaki **Kayıt ID** (eşleştirme için) |
| Anket yarıda bırakıldı | Puan verilip gönderilmez | `Geri'ye dokunuldu` / `Hareketsizlik` |
| Oturum bitti | 90 sn hareketsizlik, kiosk başa döner | Süre (sn) sütununda etkin süre |
| Uygulama açıldı | Uygulama yüklenir (kiosk: sistem olayı; telefon: oturum başı) | `Kiosk` / `Tarayıcı` / `Ana ekran (PWA)` |
| Rezervasyon bağlantısı açıldı | (Telefon) "Ödünç Cihaz Sistemi'ne git" düğmesi | — |
| Bağlantı koptu / geldi | İnternet kesintisi başı / sonu | Kesinti süresi |
| Gece yenilemesi | Kiosk 04:00'te kendini yeniler | Sağlık işareti: her gün 1 kez |
| Kayıt kaybı | iPad kuyruğu 2.000 olayı aşarsa en eskiler atılır | Atılan olay sayısı |

**Oturum:** Bir kişinin ilk dokunmasından 90 sn hareketsizliğe kadar geçen süreç. Numarası
`K-AAGG-NNN` (kiosk) ya da `T-…` (telefon) biçimindedir. Sıra numarasıdır; **kişiyi tanımlamaz**.

## 3. Sütunlar

`Kayıt No · Tarih · Saat · Gün · Cihaz · Oturum · Olay · Sayfa · Ayrıntı · Süre (sn) · Uygulama sürümü`
(+ gerçek tabloda sunucunun kaydı aldığı an: **Alınma zamanı**).

Tarih ve saat **iPad'in saatidir** (Türkiye saati). İnternet yokken oluşan olaylar da doğru saatle görünür.

## 4. Kaydedilmeyenler (gizlilik)

Ad, öğrenci numarası, e-posta, **IP adresi**, konum, cihaz kimliği, ekran görüntüsü **yoktur**.
Anketin yazılı görüşü logda değil, yalnızca anket tablosunun "Yanıtlar" sayfasındadır.
Oturum numaraları bir kişiyle ilişkilendirilemez. Bu nedenle log KVKK açısından anonim veri niteliğindedir.

> Not: Uygulama herkese açık bir adreste yayınlandığı için "Telefon" olayları, ofis dışından
> (ör. adresi paylaşılan herhangi biri) gelen ziyaretleri de içerebilir.

## 5. Kayıt yeri ve akış

```
iPad / telefon                         Google (odunccihaz@gmail.com)
───────────────                        ───────────────────────────────────────────
olay oluşur
  │
  ▼
localStorage kuyruğu  ──(toplu POST)──▶  Apps Script web uygulaması (anketle AYNI adres)
"ocinfo-log-kuyruk"                      │  tur: "log" → yalnızca kendi tablosuna yazar
 • en fazla 2.000 olay                   ▼
 • 5 dk'da bir ya da 50 olayda bir     Anket e-tablosu
 • internet yoksa bekler                 ├─ "Yanıtlar"       (mevcut, anket)
                                         ├─ "Kullanım Logu"  (YENİ, ham olaylar)
                                         └─ "Günlük Özet"    (YENİ, isteğe bağlı, otomatik)
```

- **Nerede:** Anket yanıtlarının tutulduğu **aynı Google E-Tablosu**nda, yeni bir
  **"Kullanım Logu"** sayfası. Betik zaten yalnızca bu dosyaya yazma iznine sahip
  (`spreadsheets.currentonly`); yeni bir izin ya da yeni bir adres gerekmez.
- **Nasıl gider:** Olaylar iPad'de biriktirilir ve **toplu** gönderilir (her olay için ayrı istek
  yok). İnternet yoksa kuyrukta bekler; 2.000 olayı aşarsa en eskiler silinir ve bu bir
  "kayıt kaybı" olayı olarak not edilir.
- **Erişim:** Tabloyu görebilen herkes logları da görür. Farklı kişilerin görmesi istenirse
  log ayrı bir e-tabloya (ayrı betik ve adresle) alınabilir.
- **Hacim:** Sentetik örnekte iş günü başına ~100 olay → yılda ~25.000 satır (~300 bin hücre).
  Google E-Tablolar sınırı 10 milyon hücre; yıllarca yeter. Yine de her **eğitim yılı sonunda**
  sayfa "Kullanım Logu 2026-2027" gibi adlandırılıp arşivlenmesi önerilir.
- **Saklama süresi (öneri):** 3 eğitim yılı; sonrası silinir ya da yalnızca özet tutulur.

## 6. Nasıl okunur?

- **Hızlı bakış:** "Günlük Özet" (oturum sayısı, ortalama süre, anket gönderimi / yarıda bırakılan,
  en çok açılan sayfa, en çok seçilen grafik, çevrimdışı dakika) ve "Saatlik Yoğunluk".
- **Ayrıntı:** "Kullanım Logu"nda filtre okları ile Olay / Tarih / Oturum süzülür. Bir oturumun
  tüm adımlarını görmek için Oturum sütununda o numara seçilir.
- **Excel:** Dosya → İndir → Microsoft Excel (.xlsx).
- Örnek dosyadaki **"Okuma Rehberi"** sayfası tüm sütun ve olayları açıklar.

## 7. Teknik ayrıntılar ve kurulum

- **Uygulama:** `log.js` → `log(olay, {ayrinti, sure, sistem})`; kiosk oturumu `app.js`'teki
  hareketsizlik zamanlayıcısına bağlıdır (ilk dokunma → "Oturum başladı", 90 sn → "Oturum bitti").
  Kuyruk anahtarı `ocinfo-log-kuyruk`; günlük oturum sayacı `ocinfo-log-sayac`. Gönderim:
  5 dk'da bir, 50 olayda bir, oturum bitince, bağlantı gelince; sayfa kapanırken `sendBeacon`.
  Yalnızca sunucu `ok: true` derse kuyruktan silinir; aynı paket tekrar giderse betik paket
  kimliğiyle (6 saat) ayıklar.
- **Yeni olay türü eklemek:** hem `log.js` çağrısında hem `anket.gs` → `LOG_OLAYLAR` listesinde
  aynı ad olmalıdır; yoksa betik o olayı yazmaz.
- **Sürüm:** `config.appVersion`, `sw.js` → `CACHE` ile birlikte güncellenir (logdaki "Uygulama sürümü").
- **Betik:** `anket.gs` güncellendiğinde Apps Script'e yapıştırılıp `kurulumTesti` çalıştırılır
  ("Kullanım Logu" sayfası oluşur) ve **Dağıtımları yönet → Yeni sürüm** ile dağıtılır (adres aynı).
- **Günlük özet:** Apps Script'te `gunlukOzet` işlevi "Günlük Özet" ve "Saatlik Yoğunluk"
  sayfalarını yeniden üretir. Elle çalıştırılabilir ya da **Tetikleyiciler (⏰) → Tetikleyici ekle →
  `gunlukOzet` → Zamana dayalı → Gün zamanlayıcı → 05:00–06:00** ile her sabah otomatik güncellenir.
  "Gece yenilemesi: YOK" görünen gün, kiosk'un o gece çalışmadığını gösterir.
