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
| bonartd | Claude Code | `app/**` (index.html, manifest, sw.js, assets, data/kurallar.json), `AGENTS.md` | 2026-10-21 11:00 |

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
