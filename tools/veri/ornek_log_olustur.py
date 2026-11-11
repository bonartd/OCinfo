# -*- coding: utf-8 -*-
"""OCinfo — SENTETİK kullanım logu örneği üretir (gerçek veri DEĞİLDİR).

Amaç: Kullanım logu tasarımını (docs/KULLANIM_LOGU.md) uygulamadan önce, logların nasıl
görüneceğini ve nasıl okunacağını göstermek. Rastgele ama gerçekçi bir kiosk + telefon
kullanımı simüle edilir; tohum sabittir, her çalıştırmada aynı dosya üretilir.

Kullanım (depo kökünden):
    python3 -m pip install openpyxl        # bir kez
    python3 tools/veri/ornek_log_olustur.py [çıktı.xlsx]
Varsayılan çıktı: docs/ornekler/OCinfo_kullanim_logu_ORNEK_sentetik.xlsx
"""

import collections
import datetime
import pathlib
import random
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

random.seed(20261102)

VARSAYILAN = (pathlib.Path(__file__).resolve().parents[2] / "docs" / "ornekler"
              / "OCinfo_kullanim_logu_ORNEK_sentetik.xlsx")
SURUM = "ocinfo-v16"
BASLANGIC = datetime.date(2026, 11, 2)   # Pazartesi
GUN_SAYISI = 14                          # iki hafta (hafta sonları kiosk boş)
GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

SAYFALAR = {"kurallar": "1 · Kurallar", "anket": "2 · Anket", "istatistik": "3 · Kullanım Bilgileri"}
GRAFIKLER = ["Bölümlere göre", "Sınıflara göre", "Aylara göre", "Yıllara göre"]
BOLUMLER = ["Radyo, Televizyon ve Sinema", "Yeni Medya ve İletişim", "Görsel İletişim Tasarımı",
            "Halkla İlişkiler ve Reklamcılık", "Çizgi Film ve Animasyon", "Diğer"]
AYLAR = ["Eylül 2025", "Ekim 2025", "Kasım 2025", "Aralık 2025", "Nisan 2026", "Mart 2026"]
PUANLAR = {1: "Hiç memnun değilim", 2: "Memnun değilim", 3: "Kararsızım", 4: "Memnunum", 5: "Çok memnunum"}

BASLIKLAR = ["Kayıt No", "Tarih", "Saat", "Gün", "Cihaz", "Oturum", "Olay", "Sayfa", "Ayrıntı",
             "Süre (sn)", "Uygulama sürümü"]

satirlar = []


def ekle(zaman, cihaz, oturum, olay, sayfa="", ayrinti="", sure=None):
    satirlar.append([zaman, cihaz, oturum, olay, sayfa, ayrinti, sure])


def kiosk_oturumu(baslangic, no):
    """Bir kişinin kiosk'a dokunmasından hareketsizliğe kadarki olay dizisi.
    Oturumun bittiği (kiosk'un yeniden boşa düştüğü) zamanı döndürür."""
    oturum = f"K-{baslangic:%m%d}-{no:03d}"
    t = baslangic
    sayfa = random.choices(list(SAYFALAR), weights=[45, 30, 25])[0]
    anket_yapildi = False
    ekle(t, "Kiosk (iPad)", oturum, "Oturum başladı", SAYFALAR[sayfa], "İlk dokunma")
    for _ in range(random.choices([1, 2, 3, 4, 5, 6], weights=[20, 25, 22, 15, 10, 8])[0]):
        t += datetime.timedelta(seconds=random.randint(6, 40))
        r = random.random()
        if r < 0.35:
            yeni = random.choice([s for s in SAYFALAR if s != sayfa])
            ekle(t, "Kiosk (iPad)", oturum, "Sayfa değişti", SAYFALAR[yeni],
                 f"{SAYFALAR[sayfa]} → {SAYFALAR[yeni]} ({random.choice(['sekme', 'kaydırma'])})")
            sayfa = yeni
        elif sayfa == "istatistik":
            if r < 0.7:
                ekle(t, "Kiosk (iPad)", oturum, "Grafik seçildi", SAYFALAR[sayfa],
                     random.choices(GRAFIKLER, weights=[20, 30, 40, 10])[0])
            else:
                ekle(t, "Kiosk (iPad)", oturum, "Çubuk seçildi", SAYFALAR[sayfa],
                     random.choice(BOLUMLER + AYLAR))
        elif sayfa == "anket" and not anket_yapildi:
            # 60 sn bekleme kuralı nedeniyle bir oturumda en fazla bir yanıt
            anket_yapildi = True
            puan = random.choices([1, 2, 3, 4, 5], weights=[3, 5, 12, 40, 40])[0]
            ekle(t, "Kiosk (iPad)", oturum, "Anket: puan seçildi", SAYFALAR[sayfa], f"{puan} · {PUANLAR[puan]}")
            t += datetime.timedelta(seconds=random.randint(10, 70))
            if random.random() < 0.8:
                kayit = f"{random.getrandbits(32):08x}"
                ekle(t, "Kiosk (iPad)", oturum, "Anket gönderildi", SAYFALAR[sayfa],
                     f"Yanıtlar sayfasındaki Kayıt ID: {kayit}")
            elif random.random() < 0.5:
                ekle(t, "Kiosk (iPad)", oturum, "Anket yarıda bırakıldı", SAYFALAR[sayfa], "Geri'ye dokunuldu")
            else:
                # Kişi formu bırakıp gitti: oturum hareketsizlikle biter
                ekle(t + datetime.timedelta(seconds=90), "Kiosk (iPad)", oturum, "Anket yarıda bırakıldı",
                     SAYFALAR[sayfa], "Hareketsizlik (form temizlendi)")
                break
        else:  # okuma (etkileşim yok) — süre birikir
            t += datetime.timedelta(seconds=random.randint(5, 25))
    sure = int((t - baslangic).total_seconds())
    bitis = t + datetime.timedelta(seconds=90)
    ekle(bitis, "Kiosk (iPad)", oturum, "Oturum bitti", SAYFALAR[sayfa], "90 sn hareketsizlik → başa dönüldü", sure)
    return bitis


def telefon_ziyareti(baslangic, no):
    oturum = f"T-{baslangic:%m%d}-{no:03d}"
    t = baslangic
    ekle(t, "Telefon", oturum, "Uygulama açıldı", SAYFALAR["kurallar"], random.choice(["Safari", "Ana ekran (PWA)"]))
    if random.random() < 0.55:
        t += datetime.timedelta(seconds=random.randint(8, 40))
        ekle(t, "Telefon", oturum, "Rezervasyon bağlantısı açıldı", SAYFALAR["kurallar"], "odunccihaz.yasar.edu.tr")
    if random.random() < 0.3:
        t += datetime.timedelta(seconds=random.randint(5, 30))
        ekle(t, "Telefon", oturum, "Sayfa değişti", SAYFALAR["istatistik"], "1 · Kurallar → 3 · Kullanım Bilgileri (kaydırma)")


def saat_sec():
    # Ofis saatlerinde, öğle öncesi ve öğleden sonra yoğun
    saat = random.choices(range(9, 18), weights=[6, 14, 12, 7, 9, 13, 11, 8, 4])[0]
    return datetime.time(saat, random.randint(0, 59), random.randint(0, 59))


for g in range(GUN_SAYISI):
    gun = BASLANGIC + datetime.timedelta(days=g)
    ekle(datetime.datetime.combine(gun, datetime.time(4, 0, 2)), "Kiosk (iPad)", "—", "Gece yenilemesi", "",
         "Uygulama 04:00'te kendini yeniledi")
    if gun.weekday() >= 5:
        continue
    yogunluk = 1.35 if gun.weekday() == 0 else 1.0
    # Tek iPad: oturumlar çakışmaz, sırayla numaralanır
    adaylar = sorted(datetime.datetime.combine(gun, saat_sec()) for _ in range(int(random.randint(14, 30) * yogunluk)))
    serbest = datetime.datetime.combine(gun, datetime.time(0, 0))
    for n, aday in enumerate(adaylar, start=1):
        basla = max(aday, serbest + datetime.timedelta(seconds=random.randint(20, 240)))
        serbest = kiosk_oturumu(basla, n)
    for n in range(1, random.randint(2, 7) + 1):
        telefon_ziyareti(datetime.datetime.combine(gun, saat_sec()), n)
    if random.random() < 0.3:
        kopma = datetime.datetime.combine(gun, saat_sec())
        dk = random.randint(2, 25)
        ekle(kopma, "Kiosk (iPad)", "—", "Bağlantı koptu", "", "Çevrimdışı rozeti gösterildi")
        ekle(kopma + datetime.timedelta(minutes=dk), "Kiosk (iPad)", "—", "Bağlantı geldi", "",
             f"{dk} dk çevrimdışı; bekleyen kayıtlar gönderildi", dk * 60)

satirlar.sort(key=lambda r: r[0])

# ---------- Excel ----------
BASLIK_DOLGU = PatternFill("solid", fgColor="0B2545")
UYARI_DOLGU = PatternFill("solid", fgColor="FDECEA")
BASLIK_YAZI = Font(bold=True, color="FFFFFF")


def baslik_yaz(ws, basliklar, satir=1):
    for i, b in enumerate(basliklar, start=1):
        c = ws.cell(row=satir, column=i, value=b)
        c.font = BASLIK_YAZI
        c.fill = BASLIK_DOLGU
        c.alignment = Alignment(vertical="center")


def genislik(ws, olculer):
    for i, w in enumerate(olculer, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


wb = Workbook()

# 1) Okuma rehberi
r = wb.active
r.title = "Okuma Rehberi"
rehber = [
    ("⚠ BU DOSYA SENTETİKTİR — gerçek kullanım verisi değildir. Log tasarımını göstermek için üretilmiştir.", True),
    (f"Dönem: {BASLANGIC:%d.%m.%Y} – {BASLANGIC + datetime.timedelta(days=GUN_SAYISI - 1):%d.%m.%Y} (sentetik). "
     f"Üretim: tools/veri/ornek_log_olustur.py", False),
    ("", False),
    ("SAYFALAR", True),
    ("Olay Kaydı — her satır bir olay (dokunma, sayfa değişimi, anket gönderimi…). Filtre okları ile süzülebilir.", False),
    ("Günlük Özet — her gün için oturum, anket ve sayfa/grafik tercihleri özeti.", False),
    ("Saatlik Yoğunluk — iş günlerinde saat dilimine göre kiosk oturumu sayısı.", False),
    ("", False),
    ("SÜTUNLAR (Olay Kaydı)", True),
    ("Kayıt No — sıra numarası.", False),
    ("Tarih / Saat / Gün — olayın iPad (veya telefon) saatiyle zamanı.", False),
    ("Cihaz — 'Kiosk (iPad)' veya 'Telefon' (uygulama telefondan açıldıysa).", False),
    ("Oturum — bir kişinin ilk dokunmasından 90 sn hareketsizliğe kadar geçen süreç. K-… kiosk, T-… telefon. "
     "Rastgele/sıra numarasıdır, kişiyi tanımlamaz. '—' = oturuma bağlı olmayan sistem olayı.", False),
    ("Olay — ne oldu (aşağıdaki listeye bakın).", False),
    ("Sayfa — olay anında açık olan sayfa.", False),
    ("Ayrıntı — olaya özel kısa bilgi (seçilen grafik, verilen puan, geçiş yöntemi…).", False),
    ("Süre (sn) — 'Oturum bitti' için oturumun etkin süresi (son dokunmaya kadar); 'Bağlantı geldi' için çevrimdışı kalınan süre.", False),
    ("Uygulama sürümü — olay sırasında çalışan sürüm (sorun ayıklamak için).", False),
    ("", False),
    ("OLAYLAR", True),
    ("Oturum başladı — kiosk boştayken biri ekrana dokundu (otomatik sayfa döngüsü durur).", False),
    ("Sayfa değişti — kullanıcı sekmelerle ya da kaydırarak sayfa değiştirdi. (Boşta otomatik geçişler kaydedilmez.)", False),
    ("Grafik seçildi — Sayfa 3'te açılır menüden grafik seçildi.", False),
    ("Çubuk seçildi — Sayfa 3'te bir çubuğa dokunuldu (ayrıntıda hangisi).", False),
    ("Anket: puan seçildi — yüzlerden biri seçildi (ayrıntıda puan).", False),
    ("Anket gönderildi — yanıt gönderildi; Kayıt ID, anket tablosundaki 'Yanıtlar' satırıyla eşleşir.", False),
    ("Anket yarıda bırakıldı — puan seçildi ama gönderilmedi (Geri ya da hareketsizlik).", False),
    ("Oturum bitti — 90 sn hareketsizlik; kiosk ilk sayfaya döndü.", False),
    ("Uygulama açıldı — (telefon) uygulama açıldı; ayrıntıda Safari mi ana ekran mı.", False),
    ("Rezervasyon bağlantısı açıldı — (telefon) 'Ödünç Cihaz Sistemi'ne git' düğmesine dokunuldu.", False),
    ("Bağlantı koptu / Bağlantı geldi — internet kesintisi başlangıcı/bitişi.", False),
    ("Gece yenilemesi — kiosk uygulaması 04:00'te kendini yeniledi (sağlık işareti: her gün bir kez görünmeli).", False),
    ("", False),
    ("ÖRNEK SORULAR — nasıl bulunur?", True),
    ("Kiosk günde kaç kez kullanılıyor? → Günlük Özet › 'Kiosk oturumu'.", False),
    ("Hangi saatler yoğun? → Saatlik Yoğunluk.", False),
    ("Anketi başlatıp bırakanlar ne kadar? → Günlük Özet › 'Yarıda bırakılan anket'.", False),
    ("İstatistik sayfasında en çok hangi grafik açılıyor? → Olay Kaydı'nda Olay = 'Grafik seçildi' süzün, Ayrıntı'ya bakın.", False),
    ("Kiosk o gün çalışıyor muydu? → 'Gece yenilemesi' satırı ve oturumlar var mı.", False),
    ("", False),
    ("KAYDEDİLMEYENLER", True),
    ("Ad, öğrenci numarası, e-posta, IP, konum, ekran görüntüsü yoktur. Anketin yazılı görüşü burada değil, yalnızca 'Yanıtlar' sayfasındadır.", False),
]
for i, (metin, kalin) in enumerate(rehber, start=1):
    c = r.cell(row=i, column=1, value=metin)
    c.font = Font(bold=kalin, size=12 if kalin else 11, color="B42318" if metin.startswith("⚠") else None)
    c.alignment = Alignment(wrap_text=True, vertical="top")
r.column_dimensions["A"].width = 130

# 2) Olay kaydı
o = wb.create_sheet("Olay Kaydı (sentetik)")
baslik_yaz(o, BASLIKLAR)
for no, (zaman, cihaz, oturum, olay, sayfa, ayrinti, sure) in enumerate(satirlar, start=1):
    o.append([no, zaman.strftime("%Y-%m-%d"), zaman.strftime("%H:%M:%S"), GUNLER[zaman.weekday()], cihaz,
              oturum, olay, sayfa, ayrinti, sure, SURUM])
    if olay in ("Anket yarıda bırakıldı", "Bağlantı koptu"):
        for c in o[o.max_row]:
            c.fill = UYARI_DOLGU
o.freeze_panes = "A2"
o.auto_filter.ref = f"A1:{get_column_letter(len(BASLIKLAR))}{o.max_row}"
genislik(o, [9, 12, 10, 12, 14, 15, 30, 24, 52, 10, 15])

# 3) Günlük özet
ozet = wb.create_sheet("Günlük Özet")
OZ = ["Tarih", "Gün", "Kiosk oturumu", "Ort. oturum süresi (sn)", "Telefon ziyareti", "Anket gönderimi",
      "Yarıda bırakılan anket", "En çok açılan sayfa", "En çok seçilen grafik", "Çevrimdışı (dk)"]
baslik_yaz(ozet, OZ)
gunluk = collections.OrderedDict()
for zaman, cihaz, oturum, olay, sayfa, ayrinti, sure in satirlar:
    d = gunluk.setdefault(zaman.date(), collections.defaultdict(list))
    d[olay].append((cihaz, sayfa, ayrinti, sure, oturum))
for gun, d in gunluk.items():
    sureler = [x[3] for x in d["Oturum bitti"]]
    sayfa_say = collections.Counter([x[1] for x in d["Oturum başladı"]] + [x[1] for x in d["Sayfa değişti"]])
    grafik_say = collections.Counter(x[2] for x in d["Grafik seçildi"])
    ozet.append([
        gun.strftime("%Y-%m-%d"), GUNLER[gun.weekday()], len(d["Oturum başladı"]),
        round(sum(sureler) / len(sureler)) if sureler else 0,
        len(d["Uygulama açıldı"]), len(d["Anket gönderildi"]), len(d["Anket yarıda bırakıldı"]),
        sayfa_say.most_common(1)[0][0] if sayfa_say else "—",
        grafik_say.most_common(1)[0][0] if grafik_say else "—",
        sum(x[3] or 0 for x in d["Bağlantı geldi"]) // 60,
    ])
ozet.freeze_panes = "A2"
genislik(ozet, [12, 12, 15, 22, 16, 16, 21, 24, 21, 15])

# 4) Saatlik yoğunluk
s = wb.create_sheet("Saatlik Yoğunluk")
s.append(["Saat dilimi"] + GUNLER[:5] + ["Toplam"])
baslik_yaz(s, ["Saat dilimi"] + GUNLER[:5] + ["Toplam"])
tablo = collections.Counter()
for zaman, cihaz, oturum, olay, *_ in satirlar:
    if olay == "Oturum başladı":
        tablo[(zaman.hour, zaman.weekday())] += 1
for h in range(9, 18):
    sat = [tablo[(h, g)] for g in range(5)]
    s.append([f"{h:02d}:00–{h + 1:02d}:00"] + sat + [sum(sat)])
s.freeze_panes = "B2"
genislik(s, [15, 12, 12, 12, 12, 12, 10])
# En yoğun hücreleri hafifçe vurgula
en = max(tablo.values())
for row in s.iter_rows(min_row=2, min_col=2, max_col=6):
    for c in row:
        if c.value:
            ton = int(255 - 140 * (c.value / en))
            c.fill = PatternFill("solid", fgColor=f"{ton:02X}{ton + 20 if ton + 20 < 256 else 255:02X}FF")

cikti = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else VARSAYILAN
cikti.parent.mkdir(parents=True, exist_ok=True)
wb.save(cikti)
print(f"{len(satirlar)} olay, {sum(1 for x in satirlar if x[3] == 'Oturum başladı')} kiosk oturumu -> {cikti}")
