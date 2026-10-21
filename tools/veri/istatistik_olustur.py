"""OCinfo — Ödünç Cihaz Ofisi Excel verisinden anonim istatistik JSON'u üretir.

Kullanım (depo kökünden):
    python3 -m pip install openpyxl        # bir kez
    python3 tools/veri/istatistik_olustur.py "<Excel dosyası>.xlsx"

Girdi: "Rezervasyonlar" sayfası; sütunlar: Kaynak satır, Kullanıcı, Bölüm / Birim, Sınıf,
Rezervasyon tarihi, İade tarihi. Çıktı: app/data/istatistik.json.

GİZLİLİK: Excel dosyası kişisel veri (ad soyad) içerir ve depoya ASLA eklenmez
(.gitignore *.xlsx). Çıktıya yalnızca sayımlar yazılır; ad, satır no veya tarih yazılmaz.
Farklı kullanıcı sayısı KUCUK_GRUP'tan az olan birimler "Diğer" altında birleştirilir.
"""

import collections
import datetime
import json
import pathlib
import sys

import openpyxl

DONEM_BAS = datetime.date(2025, 9, 1)
DONEM_SON = datetime.date(2026, 9, 30)
KUCUK_GRUP = 5
DIGER = "Diğer"
# Personel birimi: öğrenci olmadığı grafikte açıkça belirtilir.
YENIDEN_ADLANDIR = {"Medya Merkezi Müdürlüğü": "Medya Merkezi (personel)"}
CIKTI = pathlib.Path(__file__).resolve().parents[2] / "app" / "data" / "istatistik.json"


def tarih(deger):
    if isinstance(deger, datetime.datetime):
        return deger.date()
    if isinstance(deger, datetime.date):
        return deger
    return datetime.date.fromisoformat(str(deger).strip()[:10])


def main(xlsx):
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    satirlar = [r for r in list(wb["Rezervasyonlar"].iter_rows(values_only=True))[1:] if any(r)]

    kayitlar = []
    for _, kullanici, bolum, sinif, rez, _iade in satirlar:
        gun = tarih(rez)
        if not (DONEM_BAS <= gun <= DONEM_SON):
            continue
        sinif = str(sinif).strip()
        kayitlar.append({
            "kullanici": str(kullanici).strip().casefold(),
            "bolum": YENIDEN_ADLANDIR.get(str(bolum).strip(), str(bolum).strip()),
            "sinif": sinif if sinif in {"1", "2", "3", "4"} else "0",
            "ay": gun.strftime("%Y-%m"),
            "gun": gun.weekday(),  # 0 = Pazartesi
        })

    # Az kişili birimleri birleştir (kişinin tanınmasını önler).
    kisi = collections.defaultdict(set)
    for k in kayitlar:
        kisi[k["bolum"]].add(k["kullanici"])
    # Personel birimleri kurumsal kullanımdır; birleştirilmez.
    for k in kayitlar:
        if len(kisi[k["bolum"]]) < KUCUK_GRUP and k["bolum"] not in YENIDEN_ADLANDIR.values():
            k["bolum"] = DIGER

    rez = collections.Counter((k["bolum"], k["sinif"], k["ay"], k["gun"]) for k in kayitlar)
    kul = collections.defaultdict(set)
    kul_ay = collections.defaultdict(set)
    for k in kayitlar:
        kul[(k["bolum"], k["sinif"])].add(k["kullanici"])
        kul_ay[(k["bolum"], k["sinif"], k["ay"])].add(k["kullanici"])

    aylar = []
    a = DONEM_BAS.replace(day=1)
    while a <= DONEM_SON:
        aylar.append(a.strftime("%Y-%m"))
        a = (a.replace(day=28) + datetime.timedelta(days=4)).replace(day=1)

    cikti = {
        "kaynak": "Ödünç Cihaz Ofisi, 2025-2026 eğitim yılı rezervasyon kayıtları",
        "donem": {"baslangic": DONEM_BAS.isoformat(), "bitis": DONEM_SON.isoformat()},
        "olusturulma": datetime.date.today().isoformat(),
        "not": "Her kayıt bir rezervasyondur (cihaz adedi değildir). Sınıf '0' = sınıf bilgisi yok / personel. "
               f"{KUCUK_GRUP} kişiden az kullanıcısı olan birimler '{DIGER}' altında birleştirildi.",
        "aylar": aylar,
        # [bölüm, sınıf, "YYYY-AA", haftanın günü (0=Pzt), rezervasyon sayısı]
        "rezervasyon": [[b, s, ay, g, n] for (b, s, ay, g), n in sorted(rez.items())],
        # [bölüm, sınıf, farklı kullanıcı] — her kullanıcı tek (bölüm, sınıf) hücresindedir
        "kullanici": [[b, s, len(u)] for (b, s), u in sorted(kul.items())],
        # [bölüm, sınıf, "YYYY-AA", o ay işlem yapan farklı kullanıcı]
        "kullaniciAy": [[b, s, ay, len(u)] for (b, s, ay), u in sorted(kul_ay.items())],
    }
    CIKTI.write_text(json.dumps(cikti, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(kayitlar)} rezervasyon, {len({k['kullanici'] for k in kayitlar})} kullanıcı -> {CIKTI}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
