# -*- coding: utf-8 -*-
"""OCinfo — Ödünç Cihaz Ofisi Excel verisinden anonim istatistik JSON'u üretir.

Kullanım (depo kökünden):
    python3 -m pip install openpyxl        # bir kez
    python3 tools/veri/istatistik_olustur.py "<dosya1>.xlsx" ["<dosya2>.xlsx" ...]

İki dosya biçimi okunur:
- **Yıllık kayıt sayfaları** ("15-16 Kayıtlar", "20-21 Kayıtlar" …): eğitim yılı SAYFA ADINDAN
  alınır ("20-21" → 2020-2021). Aynı dosyadaki "Bölümler" / "Kullanıcılar" özet sayfaları atlanır.
- **Tek rezervasyon sayfası** (ör. "Rezervasyonlar"): eğitim yılı rezervasyon tarihinden
  (1 Eylül – 31 Ağustos) belirlenir.

Kurallar (AGENTS.md 3.6):
- Yalnızca TAMAMLANMIŞ eğitim yılları yazılır (31 Ağustos'u geçmiş).
- Aynı yıl birden çok kaynakta varsa KAYDI EN ÇOK olan kaynak kullanılır (kısmi tekrarlar elenir).
- Medya Merkezi (personel) ve sınıfı açıkça "0" olan kayıtlar hiç alınmaz. Sınıfı BOŞ olan eski
  kayıtlar alınır (sınıf grafiğinde görünmez).
- Bölümü belirtilmemiş kayıtlar, proje sorumlusuna göre bölüme bağlanır (yerel sorumlu_bolum.json,
  depoda yok); eşleşmezse
  "Belirtilmemiş" kalır. Bilinen bölümler kendi adıyla, diğer birimler "Diğer" altında gösterilir.
- Verilen dosyalarda bulunan yıllar app/data/istatistik.json içinde yenilenir; diğer yıllar korunur.

GİZLİLİK: Excel kişisel veri (ad soyad) içerir ve depoya ASLA eklenmez (.gitignore *.xlsx).
Çıktıya yalnızca sayımlar yazılır; ad, satır no, proje açıklaması veya tam tarih yazılmaz.
"""

import collections
import datetime
import json
import pathlib
import re
import sys
import unicodedata

import openpyxl

DIGER = "Diğer"
BELIRSIZ = "Belirtilmemiş"
# Gösterilen bölümler (yazım farklılıkları norm() ile eşlenir).
BILINEN_BOLUMLER = [
    "Radyo, Televizyon ve Sinema",
    "Görsel İletişim Tasarımı",
    "Yeni Medya ve İletişim",
    "Halkla İlişkiler ve Reklamcılık",
    "Çizgi Film ve Animasyon",
    "Film Tasarımı",
    "Endüstriyel Tasarım",
]
# Aynı bölümün eski / farklı adları.
ESANLAMLI = {
    "animasyon": "Çizgi Film ve Animasyon",
    "yeni medya ve gazetecilik": "Yeni Medya ve İletişim",
}
# Bölüm bilgisi yok sayılan değerler.
BOS_BOLUM = {"", "bölüm belirtilmemiş", "belirtilmemiş", "none"}
# İstatistiklere hiç alınmayan birimler (personel / kurumsal kullanım).
HARIC_BIRIMLER = {"medya merkezi müdürlüğü", "medya merkezi"}
# Bölümü boş kayıtlarda proje sorumlusu → bölüm eşlemesi (kullanıcı bildirimi, 2026-11-02).
# Kişi adı içerdiği için depoda DEĞİL, yerel tools/veri/sorumlu_bolum.json dosyasındadır
# (.gitignore; biçim için sorumlu_bolum.ornek.json). Dosya yoksa eşleme yapılmaz.
# Anahtarlar fold() ile karşılaştırılır (büyük/küçük harf ve Türkçe karakter farkı önemsiz).
SORUMLU_DOSYA = pathlib.Path(__file__).resolve().parent / "sorumlu_bolum.json"


def sorumlu_eslemesi():
    if not SORUMLU_DOSYA.exists():
        print(f"UYARI: {SORUMLU_DOSYA.name} yok; bölümü boş kayıtlar 'Belirtilmemiş' kalacak.")
        return {}
    veri = json.loads(SORUMLU_DOSYA.read_text(encoding="utf-8"))
    return {k: v for k, v in veri.items() if not k.startswith("_")}


CIKTI = pathlib.Path(__file__).resolve().parents[2] / "app" / "data" / "istatistik.json"
YIL_SAYFASI = re.compile(r"^\s*(\d{2})\s*-\s*(\d{2})\s+Kay[ıi]tlar\s*$", re.I)

# Başlık eşleştirme: normalize edilmiş başlık şu ifadelerden birini içeriyorsa o sütundur.
BASLIKLAR = {
    "bolum": ["bölüm", "birim"],
    "sinif": ["sınıf"],
    "teslim": ["rezervasyon", "teslim alma", "başlangıç"],
    "sorumlu": ["sorumlu"],
}


def norm(s):
    # Türkçe küçük harf: "İ" -> "i", "I" -> "ı" (str.casefold "İ"yi "i̇" yapar).
    s = str(s if s is not None else "").strip().replace("İ", "i").replace("I", "ı").lower()
    return re.sub(r"\s+", " ", s)


def fold(s):
    """Ad karşılaştırması: Türkçe karakterler ve aksanlar sadeleştirilir."""
    s = norm(s)
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return s.replace("ı", "i")


BOLUM_ESLEME = {norm(b): b for b in BILINEN_BOLUMLER}
BOLUM_ESLEME.update(ESANLAMLI)
SORUMLU_ESLEME = {fold(k): v for k, v in sorumlu_eslemesi().items()}


def bolum_adi(ham, sorumlu):
    """(bölüm, eşleme_kullanıldı) döndürür; hariç birimse None."""
    n = norm(ham)
    if n in HARIC_BIRIMLER:
        return None, False
    if n in BOS_BOLUM:
        hedef = SORUMLU_ESLEME.get(fold(sorumlu))
        return (hedef, True) if hedef else (BELIRSIZ, False)
    return BOLUM_ESLEME.get(n, DIGER), False


def tarih_saat(deger):
    """(date, saat|None) döndürür (saat şu an istatistiğe yazılmıyor)."""
    if isinstance(deger, datetime.datetime):
        saatli = (deger.hour, deger.minute) != (0, 0)
        return deger.date(), (deger.hour if saatli else None)
    if isinstance(deger, datetime.date):
        return deger, None
    s = str(deger or "").strip()
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?", s)
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


def sutunlar(ws):
    """(başlık satırı, {alan: sütun}) — Kullanıcı/Bölüm/Rezervasyon başlıkları aranır."""
    for satir_no, satir in enumerate(ws.iter_rows(min_row=1, max_row=10, values_only=True), start=1):
        basliklar = [norm(h) for h in satir]
        sutun = {}
        for alan, adaylar in BASLIKLAR.items():
            for i, h in enumerate(basliklar):
                if any(a in h for a in adaylar) and i not in sutun.values():
                    sutun[alan] = i
                    break
        if {"bolum", "teslim"} <= sutun.keys() and any("kullanıcı" in h or "ad soyad" in h for h in basliklar):
            return satir_no, sutun
    return None, None


def kayit_sayfalari(wb):
    """(sayfa, sabit_yıl|None) listesi. Yıllık kayıt sayfaları varsa yalnızca onlar okunur."""
    yillik = []
    for ws in wb.worksheets:
        m = YIL_SAYFASI.match(ws.title)
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            yillik.append((ws, f"{2000 + a}-{2000 + b}"))
    if yillik:
        return yillik
    for ws in wb.worksheets:
        if sutunlar(ws)[0]:
            return [(ws, None)]
    raise SystemExit("Rezervasyon sayfası bulunamadı (Kullanıcı, Bölüm, Rezervasyon başlıkları gerekli).")


def oku(xlsx):
    """Dosyadaki kayıtları yıllara göre döndürür: {yıl: [kayıt, ...]}."""
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    yillar = collections.defaultdict(list)
    atlanan = collections.Counter()
    for ws, sabit_yil in kayit_sayfalari(wb):
        baslik_satiri, sutun = sutunlar(ws)
        if not baslik_satiri:
            atlanan[f"başlık yok: {ws.title}"] += 1
            continue
        for r in ws.iter_rows(min_row=baslik_satiri + 1, values_only=True):
            if not any(v not in (None, "") for v in r):
                continue
            al = lambda alan: r[sutun[alan]] if alan in sutun and sutun[alan] < len(r) else None
            teslim, teslim_saat = tarih_saat(al("teslim"))
            if not teslim:
                atlanan["tarih okunamadı"] += 1
                continue
            sinif = str(al("sinif") if al("sinif") is not None else "").strip()
            if sinif == "0":
                atlanan["sınıf 0"] += 1
                continue
            bolum, eslendi = bolum_adi(al("bolum"), al("sorumlu"))
            if bolum is None:
                atlanan["hariç birim"] += 1
                continue
            if eslendi:
                atlanan["(bilgi) bölüm proje sorumlusundan"] += 1
            yil = sabit_yil or egitim_yili(teslim)
            yillar[yil].append({
                "bolum": bolum,
                "sinif": sinif if sinif in {"1", "2", "3", "4"} else "",
                "ay": teslim.strftime("%Y-%m"),
                "gun": teslim,
            })
    return yillar, atlanan


def yil_ozeti(yil, kayitlar):
    bas = int(yil[:4])
    aylar = [f"{bas + (m < 9)}-{m:02d}" for m in list(range(9, 13)) + list(range(1, 9))]
    sayim = collections.Counter((k["bolum"], k["sinif"], k["ay"]) for k in kayitlar)
    ilk = min(k["gun"] for k in kayitlar)
    son = max(k["gun"] for k in kayitlar)
    # Kısmi yıl: veri Ekim sonundan sonra başlıyor ya da Mayıs'tan önce bitiyorsa.
    kismi = ilk > datetime.date(bas, 10, 31) or son < datetime.date(bas + 1, 5, 1)
    return {
        "aylar": aylar,
        "kismi": kismi,
        "donem": {"ilk": ilk.strftime("%Y-%m"), "son": son.strftime("%Y-%m")},
        # [bölüm, sınıf ("" = bilinmiyor), "YYYY-AA", rezervasyon sayısı]
        "kayit": [list(key) + [n] for key, n in sorted(sayim.items(), key=lambda kv: str(kv[0]))],
    }


def main(dosyalar):
    bugun = datetime.date.today()
    secilen = {}  # yıl -> (kayıtlar, kaynak)
    for d in dosyalar:
        yillar, atlanan = oku(d)
        print(f"{d}: {sum(len(v) for v in yillar.values())} kayıt okundu; {dict(atlanan) or 'atlanan yok'}")
        for yil, kayitlar in yillar.items():
            onceki = secilen.get(yil)
            if onceki and len(onceki[0]) >= len(kayitlar):
                print(f"  {yil}: {pathlib.Path(d).name} ({len(kayitlar)}) yerine {onceki[1]} ({len(onceki[0])}) kullanıldı")
                continue
            if onceki:
                print(f"  {yil}: {onceki[1]} ({len(onceki[0])}) yerine {pathlib.Path(d).name} ({len(kayitlar)}) kullanıldı")
            secilen[yil] = (kayitlar, pathlib.Path(d).name)

    veri = {"yillar": {}}
    if CIKTI.exists():
        try:
            veri["yillar"] = json.loads(CIKTI.read_text(encoding="utf-8")).get("yillar", {})
        except ValueError:
            pass

    for yil in sorted(secilen):
        kayitlar = secilen[yil][0]
        if datetime.date(int(yil[5:]), 8, 31) >= bugun:
            print(f"{yil}: eğitim yılı tamamlanmadı, {len(kayitlar)} kayıt atlandı")
            continue
        veri["yillar"][yil] = yil_ozeti(yil, kayitlar)
        b = collections.Counter(k["bolum"] for k in kayitlar)
        print(f"{yil}: {len(kayitlar)} rezervasyon{' (kısmi)' if veri['yillar'][yil]['kismi'] else ''}; "
              f"belirtilmemiş {b[BELIRSIZ]}, diğer {b[DIGER]}")

    veri["yillar"] = dict(sorted(veri["yillar"].items()))
    veri["olusturulma"] = bugun.isoformat()
    veri["not"] = ("Her kayıt bir rezervasyondur (cihaz adedi değildir). Eğitim yılı 1 Eylül – 31 Ağustos. "
                   "Medya Merkezi (personel) ve sınıfı '0' olan kayıtlar dahil değildir. Sınıf '' = bilinmiyor. "
                   "Bölümü belirtilmemiş kayıtlar proje sorumlusuna göre bölüme bağlanmıştır; bağlanamayanlar "
                   f"'{BELIRSIZ}', listede olmayan birimler '{DIGER}' altındadır.")
    CIKTI.write_text(json.dumps(veri, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"-> {CIKTI} (yıllar: {', '.join(veri['yillar'])})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
