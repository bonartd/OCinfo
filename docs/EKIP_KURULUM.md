# OCinfo — Ekip Kurulum Rehberi

Bu belge iki bölümden oluşur:

- **(A)** Ekip üyelerine olduğu gibi gönderilebilecek açıklama metni
- **(B)** Üyelerin kendi YZ araçlarının (Claude Code, Cursor, Copilot, Codex, Gemini vb.)
  sohbetine yapıştıracağı hazır prompt

En sonda sık sorulan sorular bulunur.

---

## (A) Ekibe gönderilecek açıklama metni

> Merhaba,
>
> **OCinfo** projesine hoş geldin. OCinfo, Ödünç Cihaz Ofisi'nin popüler ve yeni
> ekipmanlarını, kullanım istatistiklerini ve pratik bilgileri interaktif olarak sunan,
> kullanıcı memnuniyetini de ölçen bir dijital bilgilendirme uygulaması. Ofis önündeki
> iPad'de (iPadOS 15.5) tam ekran PWA olarak çalışacak.
>
> **Depo (özel):** https://github.com/bonartd/OCinfo
> **Canlı adres:** https://bonartd.github.io/OCinfo/ (yayın açılınca aktif olacak)
>
> **Başlamak için:**
> 1. GitHub'dan gelen collaborator davetini kabul et (e-postana veya
>    https://github.com/notifications adresine düşer).
> 2. Depoyu bilgisayarına klonla:
>    `git clone https://github.com/bonartd/OCinfo.git`
> 3. Klasörü kendi YZ aracınla (Claude Code, Cursor, Copilot, Codex, Gemini…) aç.
> 4. `docs/EKIP_KURULUM.md` dosyasındaki **(B) bölümündeki prompt'u** aracının sohbetine
>    bir kez yapıştır. (Claude Code, Cursor ve Copilot kuralları zaten otomatik okur;
>    yine de prompt'u yapıştırmak en güvenli yoldur.)
>
> **Tek kural:** Yapay zekâ araçlarımızın ortak hafızası yok. Ortak hafızamız depodaki
> **`TEAM_STATUS.md`** dosyası. Her işe başlarken onu oku ve "Aktif Çalışma" tablosuna
> adını yaz; iş bitince en alta kısa bir kayıt ekle, satırını sil, commit'le ve push et.
> Başkasının adına kayıtlı dosyaya dokunma. Ayrıntılar `AGENTS.md` dosyasında.
>
> Sorun olursa bana yaz. Kolay gelsin!

---

## (B) YZ aracına yapıştırılacak hazır prompt

Aşağıdaki bloğun **tamamını** kopyalayıp aracının sohbetine yapıştır:

```text
Bu oturumda OCinfo deposunda çalışacağız. OCinfo; Ödünç Cihaz Ofisi'nin ekipmanlarını,
kullanım istatistiklerini ve pratik bilgileri sunan, kullanıcı memnuniyetini ölçen ve
iPadOS 15.5 yüklü bir iPad'de kiosk olarak çalışan bir PWA'dır (saf HTML/CSS/JS, derleme
adımı yok, app/ klasörü GitHub Pages'e yayınlanır).

Bu depoda birden fazla kişi farklı YZ araçlarıyla çalışıyor ve araçların ortak hafızası
yok. Ortak hafıza TEAM_STATUS.md dosyasıdır. Bağlayıcı kurallar AGENTS.md dosyasındadır.
Aşağıdaki protokole her oturumda harfiyen uy:

İŞE BAŞLAMADAN ÖNCE
1. `git pull --rebase` çalıştır (commit'lenmemiş yerel değişiklik varsa önce bana sor).
2. AGENTS.md'yi ve TEAM_STATUS.md'yi baştan sona oku.
3. "Aktif Çalışma" tablosunda başkasının adına kayıtlı bir dosya varsa o dosyaya DOKUNMA;
   değişiklik gerekiyorsa bana söyle ve dur.
4. "Kayıt Defteri"nin son kayıtlarını oku; aynı işi tekrar yapma, "Sıradaki adım"
   notlarını dikkate al.
5. Bana iki cümlelik durum özeti ver (son ne yapıldı, şu an kim neyle meşgul).
6. Yapacağımız işi netleştirdikten sonra "Aktif Çalışma" tablosuna bir satır ekle
   (ad, araç, dosyalar, başlangıç saati YYYY-AA-GG SS:DD), commit'le ve push et.

ÇALIŞIRKEN
- Yalnızca üstlendiğin dosyalara dokun; yeni dosya gerekirse önce satırına ekle.
- Var olan yapıyı ve isimlendirmeyi koru; büyük yeniden yazımdan kaçın.
- Yeni bağımlılık (kütüphane, CDN, araç) eklemeden önce bana sor.
- Gizli bilgi (parola, API anahtarı, token, kişisel/öğrenci verisi, .env) depoya girmez.
- Arayüz metinleri ve belgeler Türkçe.
- AGENTS.md Bölüm 3'teki teknik kurallara uy: iPadOS 15.5 Safari uyumluluğu, standalone
  PWA + iOS apple-* meta etiketleri, dokunmatik ve responsive arayüz (hedefler ≥ 44 pt),
  hareketsizlikte (varsayılan 90 sn) ana sayfaya dönüş, gün boyu çalışmada bellek
  sızıntısı olmaması, Service Worker ile çevrimdışı temel ekranlar (kabuk değişince
  sw.js sürümünü artır), hafif grafik/animasyon (SVG/canvas, transform/opacity),
  öğrenciye uygun sade arayüz. PWA'nın ekranı açık tutmayı veya çıkışı engellemeyi
  garanti etmediğini unutma; kiosk Güdümlü Erişim + Otomatik Kilit: Asla ile sağlanır.

İŞ BİTTİKTEN SONRA
1. TEAM_STATUS.md'nin EN ALTINA, dosyadaki şablona göre kayıt ekle: tarih-saat, ad,
   araç adı, durum (Tamamlandı / Devam ediyor / Bloke), dokunulan dosyalar, yapılan iş,
   sıradaki adım, commit hash. Eski kayıtları ASLA silme veya değiştirme.
2. "Aktif Çalışma" tablosundaki kendi satırını sil.
3. `git add -A` → `git commit -m "<kısa açıklama>"` → `git pull --rebase` → `git push`.
4. Push reddedilirse `git pull --rebase` ile rebase edip tekrar push et. Asla --force kullanma.
5. Commit hash'i kayda yazılmamışsa doldurup küçük bir ek commit at.

ÇAKIŞMA
- TEAM_STATUS.md çakışmasında: iki tarafın kayıtlarını da tut, tarihe göre (eskiden
  yeniye) sırala, <<<<<<< ======= >>>>>>> işaretlerini temizle, hiçbir kaydı atma.
- Kod çakışmasında tahmin etme; çakışan parçaları açıklayıp bana sor.

Benim adım: <ADINI YAZ>. Kullandığım araç: <ARAÇ ADI>.
Şimdi 1. adımdan başla ve bana durum özetini ver.
```

---

## Sık sorulanlar

### Defteri (TEAM_STATUS.md) yazmayı unuttum, ne yapmalıyım?

Sorun değil, fark ettiğin anda düzelt:

1. `git pull --rebase`
2. TEAM_STATUS.md'nin **en altına** unuttuğun iş için kayıt ekle. Tarih-saat olarak işin
   bittiği zamanı yaz; commit hash'ini `git log --oneline` ile bulup ekle.
3. "Aktif Çalışma"da satırın kaldıysa sil.
4. `git add TEAM_STATUS.md && git commit -m "TEAM_STATUS: eksik kayıt eklendi" && git push`

Kayıt tarihe göre biraz geriye düşse bile **mevcut kayıtların arasına sokma**, en alta ekle.

### Push reddedildi (`rejected` / `non-fast-forward`)

Bu, senden sonra başka birinin push ettiği anlamına gelir. Normaldir:

```bash
git pull --rebase
git push
```

Rebase sırasında çakışma çıkarsa bir sonraki soruya bak. **Asla `git push --force` kullanma.**

### Çakışma çıktı (`CONFLICT`)

- **TEAM_STATUS.md'de ise:** Dosyayı aç; `<<<<<<<`, `=======`, `>>>>>>>` arasındaki
  **her iki tarafın kayıtlarını da tut**, tarihe göre eskiden yeniye sırala, işaretleri sil.
  Sonra:
  ```bash
  git add TEAM_STATUS.md
  git rebase --continue
  git push
  ```
- **Kod dosyasında ise:** Tahmin ederek birleştirme. YZ aracına çakışan parçaları
  açıklatıp karar ver ya da dosyanın sahibine (Kayıt Defteri'nden bakabilirsin) danış.
  Emin değilsen `git rebase --abort` ile rebase'den önceki duruma dönebilirsin.

### Başkası "Aktif Çalışma"da benim çalışmam gereken dosyayı tutuyor

O kişiye yaz. Satır uzun süredir (ör. 1 günden fazla) duruyorsa ve kişi ulaşılamıyorsa
proje sahibine danış; başkasının satırını kendi başına silme.

### iPad güncellemeyi göstermiyor

Kabuk dosyası değiştiyse `app/sw.js` içindeki önbellek sürümünün artırıldığından emin ol.
iPad'de uygulamayı uygulama değiştiriciden tamamen kapatıp yeniden aç. Yayın tamamlandı mı
diye GitHub → Actions sekmesine bak.
