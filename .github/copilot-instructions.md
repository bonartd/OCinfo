# GitHub Copilot talimatları — OCinfo

Bu projede geçerli tüm çalışma kuralları [`AGENTS.md`](../AGENTS.md) dosyasındadır.
**Herhangi bir işe başlamadan önce `AGENTS.md` ve `TEAM_STATUS.md` dosyalarını oku.**

Zorunlu döngü (kısa):

1. **Başlamadan:** `git pull --rebase` → `TEAM_STATUS.md`'yi baştan sona oku → başkasının
   adına kayıtlı dosyaya dokunma → son kayıtları oku, aynı işi tekrarlama → kullanıcıya iki
   cümlelik durum özeti ver → "Aktif Çalışma" tablosuna kendini ekle.
2. **Çalışırken:** Yalnızca üstlendiğin dosyalara dokun, yapıyı ve isimlendirmeyi koru,
   yeni bağımlılık için önce sor, gizli bilgi commit'leme. Hedef: iPadOS 15.5 Safari PWA
   (AGENTS.md Bölüm 3). Arayüz metinleri Türkçe.
3. **Bitince:** `TEAM_STATUS.md`'nin **en altına** kayıt ekle (eski kayıtları silme), aktif
   çalışma satırını kaldır → `git add` / `commit` → `git pull --rebase` → `git push`.
   Push reddedilirse rebase edip tekrar dene; kod çakışmasında tahmin etme, sor.

Bu adımlar atlanamaz.
