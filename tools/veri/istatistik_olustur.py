# -*- coding: utf-8 -*-
"""OCinfo — Ödünç Cihaz Ofisi Excel verisinden anonim istatistik JSON'u üretir.

Kullanım (depo kökünden):
    python3 -m pip install openpyxl        # bir kez
    python3 tools/veri/istatistik_olustur.py "<dosya1>.xlsx" ["<dosya2>.xlsx" ...]

- Her kayıt rezervasyon tarihine göre bir EĞİTİM YILINA (1 Eylül – 31 Ağustos) atanır.
- Yalnızca TAMAMLANMIŞ eğitim yılları kullanılır (31 Ağustos'u geçmiş yıllar); devam eden
  yılın kayıtları atlanır.
- Verilen dosyalarda bulunan yıllar app/data/istatistik.json içinde yenilenir; JSON'daki
  diğer yıllar korunur. Önceki yılların dosyaları ayrı ayrı ya da birlikte verilebilir.
- Sütunlar başlık adına göre bulunur (sıra önemli değil): Kullanıcı, Bölüm / Birim, Sınıf,
  Rezervasyon (teslim alma) tarihi, İade tarihi. Tarihlerde saat varsa (ör. "2025-10-06 14:30"
  veya Excel tarih-saat hücresi) teslim alma / iade saatleri de çıkarılır.

GİZLİLİK: Excel kişisel veri (ad soyad) içerir ve depoya ASLA eklenmez (.gitignore *.xlsx).
Medya Merkezi Müdürlüğü ve sınıf bilgisi 1–4 olmayan kayıtlar hiç alınmaz. Çıktıya yalnızca sayımlar yazılır; ad, satır no veya tam tarih yazılmaz. Bir yılda farklı
kullanıcı sayısı KUCUK_GRUP'tan az olan birimler o yıl için "Diğer" altında birleştirilir.
"""

import collections
import datetime
import json
import pathlib
import re
import sys

import openpyxl

KUCUK_GRUP = 5
DIGER = "Diğer"
# İstatistiklere hiç alınmayan birimler (personel / kurumsal kullanım).
HARIC_BIRIMLER = {"medya merkezi müdürlüğü"}
# Yazım farklılıklarını tek ada bağlamak için bilinen bölüm adları.
BILINEN_BOLUMLER = [
    "Radyo, Televizyon ve Sinema",
    "Görsel İletişim Tasarımı",
    "Yeni Medya ve İletişim",
    "Halkla İlişkiler ve Reklamcılık",
    "Çizgi Film ve Animasyon",
    "Endüstriyel Tasarım",
    "Film Tasarımı",
]
CIKTI = pathlib.Path(__file__).resolve().parents[2] / "app" / "data" / "istatistik.json"

# Başlık eşleştirme: normalize edilmiş başlık şu ifadelerden birini içeriyorsa o sütundur.
BASLIKLAR = {
    "kullanici": ["kullanıcı", "ad soyad", "adı soyadı"],
    "bolum": ["bölüm", "birim"],
    "sinif": ["sınıf"],
    "teslim": ["rezervasyon tarihi", "teslim alma", "başlangıç"],
    "iade": ["iade"],
}


def norm(s):
    # Türkçe küçük harf: "İ" -> "i", "I" -> "ı" (str.casefold "İ"yi "i̇" yapar).
    s = str(s or "").strip().replace("İ", "i").replace("I", "ı").lower()
    return re.sub(r"\s+", " ", s)


BOLUM_ESLEME = {norm(b): b for b in BILINEN_BOLUMLER}


def bolum_adi(ham):
    n = norm(ham)
    return BOLUM_ESLEME.get(n, str(ham or "").strip() or "Belirtilmemiş")


def tarih_saat(deger):
    """(date, saat|None) döndürür. Saat yalnızca hücrede gerçekten saat varsa dolar."""
    if isinstance(deger, datetime.datetime):
        saatli = (deger.hour, deger.minute) != (0, 0)
        return deger.date(), (deger.hour if saatli else None)
    if isinstance(deger, datetime.date):
        return deger, None
    s = str(deger or "").strip()
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?", s) or None
    if m:
        y, mo, d, h, _ = m.groups()
    else:
        m = re.match(r"(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{2}))?", s)
        if not m:
            return None, None
        d, mo, y, h, _ = m.groups()
    return datetime.date(int(y), int(mo), int(d)), (int(h) if h is not None else None)


def egitim_yili(gun):
    bas = gun.year if gun.month >= 9 else gun.year - 1
    return f"{bas}-{bas + 1}"


def sayfa_ve_sutunlar(wb):
    for ws in wb.worksheets:
        for satir_no, satir in enumerate(ws.iter_rows(min_row=1, max_row=10, values_only=True), start=1):
            basliklar = [norm(h) for h in satir]
            sutun = {}
            for alan, adaylar in BASLIKLAR.items():
                for i, h in enumerate(basliklar):
                    if any(a in h for a in adaylar) and i not in sutun.values():
                        sutun[alan] = i
                        break
            if {"kullanici", "bolum", "teslim"} <= sutun.keys():
                return ws, satir_no, sutun
    raise SystemExit("Rezervasyon sayfası bulunamadı (Kullanıcı, Bölüm, Rezervasyon tarihi başlıkları gerekli).")


def oku(xlsx):
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    ws, baslik_satiri, sutun = sayfa_ve_sutunlar(wb)
    kayitlar, atlanan = [], collections.Counter()
    for r in ws.iter_rows(min_row=baslik_satiri + 1, values_only=True):
        if not any(r):
            continue
        al = lambda alan: r[sutun[alan]] if alan in sutun and sutun[alan] < len(r) else None
        teslim, teslim_saat = tarih_saat(al("teslim"))
        if not teslim:
            atlanan["tarih okunamadı"] += 1
            continue
        if norm(al("bolum")) in HARIC_BIRIMLER:
            atlanan["hariç birim"] += 1
            continue
        iade, iade_saat = tarih_saat(al("iade"))
        sinif = str(al("sinif") or "").strip()
        # Sınıf bilgisi 1–4 olmayan kayıtlar (ör. "0") hiç kullanılmaz.
        if sinif not in {"1", "2", "3", "4"}:
            atlanan["sınıf 1–4 değil"] += 1
            continue
        kayitlar.append({
            "kullanici": norm(al("kullanici")),
            "bolum": bolum_adi(al("bolum")),
            "sinif": sinif,
            "yil": egitim_yili(teslim),
            "ay": teslim.strftime("%Y-%m"),
            "tg": teslim.weekday(),            # teslim alma günü, 0 = Pazartesi
            "ig": iade.weekday() if iade else None,
            "ts": teslim_saat,
            "is": iade_saat,
        })
    return kayitlar, atlanan


def yil_ozeti(yil, kayitlar):
    kisi = collections.defaultdict(set)
    for k in kayitlar:
        kisi[k["bolum"]].add(k["kullanici"])
    for k in kayitlar:
        if len(kisi[k["bolum"]]) < KUCUK_GRUP:
            k["bolum"] = DIGER

    bas = int(yil[:4])
    aylar = [f"{bas + (m < 9)}-{m:02d}" for m in list(range(9, 13)) + list(range(1, 9))]
    sayim = collections.Counter(
        (k["bolum"], k["sinif"], k["ay"], k["tg"], k["ig"], k["ts"], k["is"]) for k in kayitlar)
    return {
        "aylar": aylar,
        "saatVar": any(k["ts"] is not None or k["is"] is not None for k in kayitlar),
        # [bölüm, sınıf, "YYYY-AA", teslim günü, iade günü|null, teslim saati|null, iade saati|null, sayı]
        "kayit": [list(key) + [n] for key, n in sorted(sayim.items(), key=lambda kv: str(kv[0]))],
    }


def main(dosyalar):
    bugun = datetime.date.today()
    yillara = collections.defaultdict(list)
    for d in dosyalar:
        kayitlar, atlanan = oku(d)
        for k in kayitlar:
            yillara[k["yil"]].append(k)
        print(f"{d}: {len(kayitlar)} kayıt okundu; atlanan: {dict(atlanan) or 'yok'}")

    veri = {"yillar": {}}
    if CIKTI.exists():
        try:
            onceki = json.loads(CIKTI.read_text(encoding="utf-8"))
            veri["yillar"] = onceki.get("yillar", {})
        except ValueError:
            pass

    for yil in sorted(yillara):
        bitis = datetime.date(int(yil[5:]), 8, 31)
        if bitis >= bugun:
            print(f"{yil}: eğitim yılı tamamlanmadı, {len(yillara[yil])} kayıt atlandı")
            continue
        veri["yillar"][yil] = yil_ozeti(yil, yillara[yil])
        print(f"{yil}: {len(yillara[yil])} rezervasyon yazıldı")

    veri["yillar"] = dict(sorted(veri["yillar"].items()))
    veri["olusturulma"] = bugun.isoformat()
    veri["not"] = ("Her kayıt bir rezervasyondur (cihaz adedi değildir). Eğitim yılı 1 Eylül – 31 Ağustos. "
                   "Medya Merkezi Müdürlüğü (personel) kayıtları ve sınıf bilgisi 1–4 olmayan kayıtlar dahil değildir. "
                   f"Bir yılda {KUCUK_GRUP} kişiden az kullanıcısı olan birimler '{DIGER}' altındadır. "
                   "Teslim alma günü = rezervasyon başlangıç tarihi.")
    CIKTI.write_text(json.dumps(veri, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"-> {CIKTI} (yıllar: {', '.join(veri['yillar'])})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
