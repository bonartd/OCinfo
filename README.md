# OCinfo

> ⚠️ **ÖNCE [`TEAM_STATUS.md`](TEAM_STATUS.md) DOSYASINI OKU.**
> Kimin hangi dosyada çalıştığı ve en son ne yapıldığı oradadır.
> Bağlayıcı çalışma kuralları: [`AGENTS.md`](AGENTS.md).

**OCinfo**, Ödünç Cihaz Ofisi'nin popüler ve yeni ekipmanlarını, kullanım istatistiklerini
ve pratik bilgileri interaktif olarak sunan, kullanıcı memnuniyetini de ölçen dijital
bilgilendirme uygulamasıdır. Ofis önünde öğrencilerin kullanımına sunulan bir iPad'de
(iPadOS 15.5) tam ekran PWA olarak çalışır.

> 🚧 **Durum:** Kiosk kabuğu (PWA, çevrimdışı önbellek, otomatik sayfa dönüşü, hareketsizlikte
> başa dönüş), **Sayfa 1 — rezervasyon QR + kurallar** ve **Sayfa 2 — memnuniyet anketi
> (deneme)** hazır. Anketin Google Drive bağlantısı için: [`docs/ANKET_KURULUM.md`](docs/ANKET_KURULUM.md).
> En çok kullanılan ekipmanlar ve kullanım yoğunluğu sayfaları planlandı (bkz. AGENTS.md 4.2.1).

- **Depo:** https://github.com/bonartd/OCinfo (herkese açık / public)
- **Canlı adres:** https://bonartd.github.io/OCinfo/
- **Ofisin resmî sitesi (rezervasyon):** https://odunccihaz.yasar.edu.tr/ — kurallar ve
  inceleme: [`docs/OFIS_KURALLARI.md`](docs/OFIS_KURALLARI.md)

---

## Teknoloji

- Saf **HTML + CSS + JavaScript** (ES2020, ES modülleri) — derleme adımı ve npm bağımlılığı yok.
- **PWA:** Web App Manifest + iOS `apple-*` meta etiketleri + Service Worker (çevrimdışı önbellek).
- **Yayın:** GitHub Actions ile `app/` klasörü GitHub Pages'e yayınlanır.

Neden bu seçim: iPadOS 15.5 Safari ile en yüksek uyumluluk, en az bakım yükü, her
yapay zekâ aracının kolayca anlayabileceği yapı ve doğrudan GitHub Pages'te çalışma.

## Hedef cihaz ve teknik gereksinimler

Ayrıntılı ve bağlayıcı kurallar [`AGENTS.md` → Bölüm 3](AGENTS.md#3-teknik-kurallar-hedef-cihaz-ve-ortam)
içindedir. Özet:

| Gereksinim | Kural |
|---|---|
| Cihaz | iPad, **iPadOS 15.5 (19F77)**, Safari/WebKit 15.5 |
| Uygulama türü | Ana ekrana eklenen, tam ekran (standalone) **PWA** |
| Etkileşim | Dokunmatik; hedefler ≥ 44×44 pt; dikey + yatay responsive |
| Hareketsizlik | Varsayılan **90 sn** işlem yoksa ana sayfaya dönüş (`config.js` ile ayarlanır) |
| Uzun çalışma | Gün boyu açık; bellek sızıntısı yok, zamanlayıcılar temizlenir |
| Kiosk | **Güdümlü Erişim** + **Otomatik Kilit: Asla** + şarja bağlı (aşağıya bakın) |
| Sınırlama | PWA tek başına ekranı açık tutmayı / çıkışı engellemeyi **garanti etmez** |
| Çevrimdışı | Service Worker ile temel ekranlar internet kesilince de çalışır |
| Performans | SVG/canvas grafikler, yalnızca `transform`/`opacity` animasyonları, optimize görseller |
| Arayüz | Öğrenciye uygun, sade, Türkçe, kolay gezilebilir; her ekranda "Ana sayfa" |

### iPad kiosk kurulumu

1. iPad'de Safari ile canlı adresi açın → **Paylaş** → **Ana Ekrana Ekle**.
2. **Ayarlar → Ekran ve Parlaklık → Otomatik Kilit → Asla.**
3. **Ayarlar → Erişilebilirlik → Güdümlü Erişim → Aç**; **Parola Ayarları**'ndan bir parola
   belirleyin; **Ekran Kilidi** seçeneğini **Asla** yapın.
4. Ana ekrandaki OCinfo simgesiyle uygulamayı açın, yan (veya ana) düğmeye **üç kez** basın →
   **Başlat**. Çıkmak için yine üç kez basıp parolayı girin.
5. iPad'i sürekli şarja bağlı tutun.

## Kurulum (geliştiriciler için)

```bash
git clone https://github.com/bonartd/OCinfo.git
cd OCinfo
cd app && python3 -m http.server 8080
```

Tarayıcıda `http://localhost:8080` açılır. Depo herkese açıktır; ancak **push yetkisi** için depo sahibinin
sizi **collaborator** olarak eklemesi gerekir.

## Dizin düzeni

```
OCinfo/
├── AGENTS.md            # Bağlayıcı kurallar (tüm YZ araçları)
├── TEAM_STATUS.md       # Ortak çalışma defteri
├── README.md            # Bu dosya
├── CLAUDE.md            # Claude Code köprüsü
├── .cursorrules         # Cursor köprüsü
├── .github/
│   ├── copilot-instructions.md   # Copilot köprüsü
│   └── workflows/pages.yml       # GitHub Pages yayını
├── docs/
│   ├── EKIP_KURULUM.md  # Ekibe gönderilecek metin + hazır prompt
│   └── OFIS_KURALLARI.md # Ofis kuralları + inceleme
└── app/                 # Yayınlanan uygulama (yalnızca bu klasör yayınlanır)
    ├── index.html, manifest.webmanifest, sw.js
    ├── assets/css/app.css
    ├── assets/js/       # config, app, idle, rotator, pages/
    ├── assets/img/      # ikonlar + QR
    └── data/            # kurallar.json (ileride ekipman / istatistik JSON'ları)
```

## Günlük git akışı

```bash
# 1) Başlarken
git pull --rebase
#    TEAM_STATUS.md'yi oku, "Aktif Çalışma"ya kendini ekle, sonra:
git add TEAM_STATUS.md && git commit -m "TEAM_STATUS: <ad> çalışmaya başladı"
git pull --rebase && git push

# 2) Çalışırken: yalnızca üstlendiğin dosyalar

# 3) Bitirince: TEAM_STATUS.md'nin EN ALTINA kayıt ekle, aktif satırını sil
git add -A
git commit -m "<kısa açıklama>"
git pull --rebase
git push        # reddedilirse: git pull --rebase → tekrar git push
```

Ekip üyeleri için ayrıntılı başlangıç rehberi ve YZ araçlarına yapıştırılacak hazır prompt:
[`docs/EKIP_KURULUM.md`](docs/EKIP_KURULUM.md).
