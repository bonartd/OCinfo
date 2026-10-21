# AGENTS.md — OCinfo Ekip Çalışma Kuralları

> Bu dosya, bu depoda çalışan **tüm yapay zekâ araçları** (Claude Code, Cursor, Copilot,
> Codex, Gemini vb.) ve insanlar için **bağlayıcıdır**. Araçların ortak hafızası yoktur;
> ortak hafıza [`TEAM_STATUS.md`](TEAM_STATUS.md) dosyasıdır.

**Proje:** OCinfo — Ödünç Cihaz Ofisi'nin popüler ve yeni ekipmanlarını, kullanım
istatistiklerini ve pratik bilgileri interaktif olarak sunan, kullanıcı memnuniyetini de
ölçen dijital bilgilendirme uygulaması. Ofis önündeki bir iPad'de (iPadOS 15.5) kiosk
olarak çalışan bir PWA'dır.

---

## 1. Zorunlu çalışma döngüsü

### 1.1 İşe başlamadan önce

1. `git pull --rebase` çalıştır. (Yerelde commit'lenmemiş değişiklik varsa önce kullanıcıya sor.)
2. `TEAM_STATUS.md` dosyasını **baştan sona** oku.
3. **"Aktif Çalışma"** tablosunda bir dosya başkasının adına kayıtlıysa **o dosyaya dokunma**.
   O dosyada değişiklik gerekiyorsa kullanıcıya bildir ve dur.
4. **"Kayıt Defteri"**nin son kayıtlarını oku; **aynı işi tekrar yapma**, "Sıradaki adım"
   notlarını dikkate al.
5. Kullanıcıya **iki cümlelik durum özeti** ver (son ne yapıldı, şu an kim neyle meşgul).
6. "Aktif Çalışma" tablosuna kendini ekle (ad, araç, dosyalar, başlangıç saati), bu
   değişikliği commit'leyip push et ki diğerleri görsün:
   ```bash
   git add TEAM_STATUS.md
   git commit -m "TEAM_STATUS: <ad> çalışmaya başladı"
   git pull --rebase && git push
   ```

### 1.2 Çalışırken

- **Yalnızca üstlendiğin dosyalara dokun.** Yeni bir dosyaya ihtiyaç doğarsa önce
  "Aktif Çalışma" satırına ekle.
- **Var olan yapıyı ve isimlendirmeyi koru.** Dosya/klasör/değişken adlarını keyfî değiştirme.
- **Büyük yeniden yazımdan kaçın.** Küçük, gözden geçirilebilir değişiklikler yap.
  Kapsamlı bir yeniden düzenleme gerekiyorsa önce kullanıcıya sor.
- **Yeni bağımlılık (kütüphane, CDN, araç) eklemeden önce kullanıcıya sor.**
- **Gizli bilgi depoya girmez:** parola, API anahtarı, token, kişisel veri, öğrenci
  bilgisi, `.env` dosyası commit'lenmez. Depo özel olsa bile yayınlanan site herkese açıktır.
- Arayüz metinleri ve belgeler **Türkçe** yazılır. Kod içi isimler İngilizce olabilir.
- Bölüm 3'teki **teknik kurallara** uy.

### 1.3 İş bittikten sonra

1. `TEAM_STATUS.md` dosyasının **en altına** yeni bir kayıt ekle (şablon dosyanın içinde).
   **Eski kayıtlar asla silinmez veya değiştirilmez.**
2. "Aktif Çalışma" tablosundaki kendi satırını sil.
3. Kaydet ve gönder:
   ```bash
   git add -A
   git commit -m "<kısa açıklama>"
   git pull --rebase
   git push
   ```
4. **Push reddedilirse:** `git pull --rebase` ile tekrar rebase et, çakışma varsa
   Bölüm 2'ye göre çöz, sonra yeniden `git push`. Asla `--force` kullanma.
5. Commit hash'i kayda yazılmamışsa (`git log -1 --format=%h`) kaydı güncelleyip ayrı bir
   küçük commit at: `TEAM_STATUS.md: commit hash'i doldur`.

---

## 2. Çakışma çözümü

- **`TEAM_STATUS.md` çakışmasında:** iki tarafın kayıtlarını da **tut**, kayıtları
  **tarih-saate göre** (eskiden yeniye) sırala, `<<<<<<<`, `=======`, `>>>>>>>`
  işaretlerini temizle. **Hiçbir kaydı atma.** "Aktif Çalışma" tablosunda iki tarafın
  satırlarını birleştir (bitmiş işin satırı hariç).
- **Kod çakışmasında: tahmin etme, kullanıcıya sor.** Çakışan parçaları ve iki tarafın
  amacını açıklayarak kullanıcının karar vermesini bekle.
- Çakışma çözümünden sonra: `git add <dosya>` → `git rebase --continue` → `git push`.

---

## 3. Teknik kurallar (hedef cihaz ve ortam)

Uygulama, Ödünç Cihaz Ofisi önünde öğrencilerin kullanımına sunulan
**iPadOS 15.5 (19F77)** yüklü bir iPad'de çalışacaktır. Aşağıdaki kurallar zorunludur.

### 3.1 Platform ve PWA

- Uygulama, iPad ana ekranına eklenebilen ve **tam ekran (standalone)** açılan bir **PWA**dır.
  - `manifest.webmanifest` içinde `"display": "standalone"` (veya `fullscreen`).
  - iOS 15 manifest'i kısmen okur; bu yüzden `<head>` içinde şunlar **ayrıca** bulunmalıdır:
    `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`,
    `apple-mobile-web-app-title`, `apple-touch-icon` (180×180 PNG) ve
    `viewport` (`width=device-width, initial-scale=1, viewport-fit=cover`).
  - Çentik/kenar boşlukları için `env(safe-area-inset-*)` kullanılır.
- **Tüm teknolojiler iPadOS 15.5 Safari (WebKit 15.5) ile uyumlu olmalıdır.** Kullanılmaması
  gerekenler (Safari 15.5'te yok veya sorunlu): CSS nesting, container queries, `color-mix()`,
  `:has()`'e bağımlı kritik düzen, regex lookbehind (`(?<=...)`), `Array.prototype.findLast`,
  Web Push / bildirimler, Wake Lock API, View Transitions, `popover`, `<dialog>`'a dayalı
  kritik akışlar (yalnızca 15.4+ — test edilmeden kullanılmaz).
  Şüphede kalırsan [caniuse.com](https://caniuse.com) üzerinde "Safari on iOS 15.4–15.5"
  sütununu kontrol et.
- **Teknoloji:** Saf HTML + CSS + JavaScript (ES2020, ES modülleri), **derleme adımı yok**.
  Framework veya npm bağımlılığı eklenmez (yeni bağımlılık için kullanıcıya sorulur).

### 3.2 Dokunmatik ve arayüz

- Arayüz **dokunmatik kullanıma** göre tasarlanır: dokunma hedefleri en az **44×44 pt**,
  hover'a bağlı işlev yok, çift dokunmada yakınlaştırma engellenir
  (`touch-action: manipulation`), metin seçimi ve uzun basma menüsü gereksiz yerlerde
  kapatılır (`-webkit-user-select: none`, `-webkit-touch-callout: none`).
- **Responsive:** iPad dikey ve yatay yönlendirmede düzgün görünmelidir.
- **Öğrenci kullanımına uygun, sade, anlaşılır ve kolay gezilebilir** arayüz: her ekranda
  ana sayfaya dönüş düğmesi, en fazla 2–3 seviye derinlik, büyük okunaklı yazı, yeterli kontrast.
- Tüm arayüz metinleri **Türkçe**.

### 3.3 Kiosk kullanımı ve uzun süreli çalışma

- **Hareketsizlik zaman aşımı:** Kullanıcı belirli bir süre (varsayılan **90 sn**,
  `app/assets/js/config.js` içinde ayarlanabilir) işlem yapmadığında uygulama açık
  formları/durumları sıfırlayıp **ana sayfaya döner**. `touchstart`, `pointerdown`,
  `keydown`, `scroll` olayları sayacı sıfırlar.
- Uygulama **gün boyu açık** kalacaktır: bellek sızıntısı olmamalı (dinleyiciler, zamanlayıcılar,
  `setInterval`'ler temizlenmeli), DOM sürekli büyümemeli, konsol hatası bırakılmamalı.
  Gerekirse gece belirli bir saatte sessiz `location.reload()` planlanabilir.
- **PWA tek başına** ekranın sürekli açık kalmasını veya uygulamadan çıkılmasını
  **engellemeyi garanti etmez** (iOS 15'te Wake Lock API yoktur). Bu yüzden kiosk kurulumu
  cihaz ayarlarıyla yapılır ve README'de belgelenir:
  - **Güdümlü Erişim (Guided Access):** Ayarlar → Erişilebilirlik → Güdümlü Erişim → Aç;
    parola belirlenir; uygulama açıkken yan/ana düğmeye üç kez basılarak başlatılır.
  - **Otomatik Kilit:** Ayarlar → Ekran ve Parlaklık → Otomatik Kilit → **Asla**
    (Güdümlü Erişim'in kendi "Ekran Kilidi" ayarı da "Asla" yapılmalıdır).
  - Cihaz şarja bağlı tutulmalıdır.
- Kod bu ayarları varsaymamalıdır: uygulama arka plana gidip geri geldiğinde
  (`visibilitychange`, `pageshow`) kendini toparlamalı ve ana sayfaya dönebilmelidir.

### 3.4 Çevrimdışı çalışma

- **Service Worker** ile uygulama kabuğu (HTML, CSS, JS, ikonlar, temel veri JSON'ları)
  önbelleğe alınır; **internet geçici olarak kesildiğinde temel ekranlar çalışmalıdır.**
- Önbellek adı sürüm içerir (ör. `ocinfo-v1`). **Kabuk dosyalarında değişiklik yapan herkes
  `app/sw.js` içindeki sürüm numarasını artırır**; eski önbellekler `activate` adımında silinir.
- Veri JSON'ları için "önce ağ, olmazsa önbellek" (network-first) stratejisi; statik
  dosyalar için "önce önbellek" (cache-first).
- Memnuniyet anketi yanıtları çevrimdışıyken yerelde (`localStorage`/IndexedDB) kuyruğa
  alınır, bağlantı gelince gönderilir. iOS'ta Background Sync yoktur; gönderim uygulama
  açıkken `online` olayı ve periyodik denemeyle yapılır.

### 3.5 Performans

- Grafik, animasyon ve görseller iPad performansını olumsuz etkilememelidir:
  - Grafikler için önce **satır içi SVG** veya basit `<canvas>`; ağır grafik kütüphanesi eklenmez.
  - Animasyonlar yalnızca `transform` ve `opacity` ile, kısa (≤ 300 ms);
    `prefers-reduced-motion` desteklenir. Sürekli dönen/oynayan animasyon yok.
  - Görseller **WebP/JPEG**, ekran boyutuna uygun ölçüde (en fazla ~1600 px genişlik),
    `loading="lazy"` ile. Büyük video yok.
  - Büyük `box-shadow`, `backdrop-filter` ve `filter: blur()` kullanımından kaçınılır.

### 3.6 Veri ve gizlilik

- Ekipman listesi, istatistikler ve pratik bilgiler `app/data/*.json` dosyalarında tutulur;
  içerik güncellemesi kod değiştirmeden bu dosyalarla yapılır.
- Memnuniyet anketi **anonimdir**; öğrenci adı, numarası, e-posta toplanmaz.
- Anket yanıtlarının nereye gönderileceği (ör. Google Apps Script, form servisi) **henüz
  kararlaştırılmadı** — karar verilmeden uç nokta eklenmez; anahtar/URL gizliyse depoya girmez.

---

## 4. Projeye özel teknik notlar

### 4.1 Nasıl çalıştırılır

Derleme adımı yoktur. Yerelde `app/` klasörünü bir statik sunucuyla açın:

```bash
cd app
python3 -m http.server 8080
```

Tarayıcıda `http://localhost:8080` adresine gidin. Service Worker yalnızca `localhost`
veya HTTPS üzerinde çalışır. iPad'de test için yayın adresini (GitHub Pages) kullanın;
Mac'teki Safari → Geliştir menüsünden bağlı iPad'deki sayfa incelenebilir.

### 4.2 Dizin düzeni

```
OCinfo/
├── AGENTS.md                  # Bu dosya — bağlayıcı kurallar
├── TEAM_STATUS.md             # Ortak çalışma defteri (ortak hafıza)
├── README.md                  # Tanıtım, kurulum, git akışı
├── CLAUDE.md                  # Claude Code köprüsü → AGENTS.md
├── .cursorrules               # Cursor köprüsü → AGENTS.md
├── .github/
│   ├── copilot-instructions.md  # Copilot köprüsü → AGENTS.md
│   └── workflows/pages.yml      # app/ klasörünü GitHub Pages'e yayınlar
├── docs/
│   └── EKIP_KURULUM.md        # Ekibe gönderilecek metin + hazır prompt
└── app/                       # YAYINLANAN UYGULAMA (yalnızca bu klasör yayınlanır)
    ├── index.html             # (şu an yer tutucu)
    ├── manifest.webmanifest   # (henüz yok)
    ├── sw.js                  # Service Worker (henüz yok)
    ├── assets/css/            # Stiller
    ├── assets/js/             # Betikler (config.js, idle-timer vb.)
    ├── assets/img/            # İkonlar ve görseller
    └── data/                  # Ekipman, istatistik, bilgi JSON'ları
```

### 4.3 Yayın akışı

- `main` dalına yapılan her push, `.github/workflows/pages.yml` iş akışını tetikler ve
  **yalnızca `app/` klasörünü** GitHub Pages'e yayınlar. Belgeler (AGENTS.md vb.) yayınlanmaz.
- Yayın 1–2 dakika sürer; durum GitHub → Actions sekmesinden izlenir.
- Kabuk dosyası değiştiyse `sw.js` sürümünü artırmayı unutmayın; aksi hâlde iPad eski
  sürümü göstermeye devam eder. iPad'de güncellemeyi görmek için uygulamayı kapatıp açın.
- Doğrudan `main` dalında çalışılır; büyük değişiklikler için ayrı dal + Pull Request tercih edilir.
