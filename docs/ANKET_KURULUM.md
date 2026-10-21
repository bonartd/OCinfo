# Memnuniyet Anketi — Google Drive Kurulumu

OCinfo'nun 2. sayfasındaki memnuniyet anketi, yanıtları ekibin ortak Google E-Tablosu
**"Mega Tablo - 2026"** içindeki **"OCinfo"** sayfasına yazar. Tablo istenildiği an
**Excel (.xlsx)** olarak indirilebilir.

> Tablonun kimliği (ID) depo herkese açık olduğu için buraya yazılmaz. Tablo adresindeki
> `/d/` ile `/edit` arasındaki kısımdır; Drive'da tabloyu açarak alabilirsiniz.

## Toplanan sütunlar

| Tarih | Saat | Kullanıcı adı | Puan (1-5) | Memnuniyet | Görüş ve öneri | Kayıt ID | Alınma zamanı |
|---|---|---|---|---|---|---|---|
| 2026-10-21 | 12:34:05 | (boş olabilir) | 5 | Çok memnunum | … | lz3k…-a1b2c3 | (sunucu saati) |

- Sütunlar "OCinfo" sayfasının ilk satırına betik tarafından yazılır; sıralarını değiştirmeyin.
- **Tarih/Saat:** Yanıtın iPad'de verildiği an (internet yokken verilen yanıtlar da doğru saatle gelir).
- **Kullanıcı adı ve görüş isteğe bağlıdır.** Öğrenci numarası, e-posta vb. istenmez.
- **Kayıt ID:** Aynı yanıtın iki kez yazılmasını önler; dokunmayın.

## Kurulum (bir kez, ~5 dakika)

Betik **bağımsız** bir Apps Script projesidir: ortak tabloya bağlı başka betiklerle
çakışmaz ve tabloda **yalnızca "OCinfo" sayfasına** yazar (sayfa yoksa yeni sayfa açmaz,
hata verir).

1. Tablonun sahibi / düzenleme yetkisi olan hesapla **https://script.google.com** → **Yeni proje**.
   Proje adı: `OCinfo Anket`.
2. `Kod.gs` içeriğini silin; depodaki
   [`tools/google-apps-script/anket.gs`](../tools/google-apps-script/anket.gs) dosyasının
   **tamamını** yapıştırın, **Kaydet**.
3. Soldaki ⚙️ **Proje Ayarları** → en altta **Komut dosyası özellikleri** → **Özellik ekle**:
   - Özellik: `SPREADSHEET_ID`
   - Değer: tablo adresindeki `/d/` ile `/edit` arasındaki kısım → **Kaydet**.
4. Düzenleyiciye dönün, üstteki işlev listesinden **`kurulumTesti`**'ni seçip **Çalıştır**.
   İzin isteyecek: hesabı seçin → "Gelişmiş" → "OCinfo Anket'e git (güvenli değil)" → **İzin ver**
   (kendi betiğiniz için bu uyarı normaldir). Günlükte `Tamam: "OCinfo" sayfası…` görmelisiniz;
   tablodaki "OCinfo" sayfasına başlık satırı yazılır.
5. Sağ üstte **Dağıt → Yeni dağıtım** → ⚙️ tür: **Web uygulaması**
   - Açıklama: `OCinfo anket`
   - Şu kullanıcı olarak yürüt: **Ben**
   - Erişimi olan kullanıcılar: **Herkes**
   - **Dağıt**
6. Verilen **Web uygulaması URL'sini** (`https://script.google.com/macros/s/…/exec`) kopyalayın
   ve tarayıcıda açın: `{"ok":true,"mesaj":"OCinfo anket uç noktası çalışıyor","sayfa":"OCinfo",…}`
   görmelisiniz.
7. URL'yi `app/assets/js/config.js` içindeki `surveyEndpoint` alanına yazın, commit + push edin
   (ya da URL'yi YZ aracınıza verip bu adımı ona yaptırın).

## Excel olarak indirme

Tablo açıkken **Dosya → İndir → Microsoft Excel (.xlsx)**.

## Bilmeniz gerekenler

- **Bağlantı yoksa:** Yanıtlar iPad'de saklanır; internet gelince (ve en geç 60 sn'de bir)
  otomatik gönderilir. `surveyEndpoint` boşken de yanıtlar iPad'de birikir, adres girilince gider.
- **Betiği değiştirirseniz:** Dağıt → Dağıtımları yönet → kalem simgesi → Sürüm: **Yeni sürüm** →
  Dağıt. Böylece URL değişmez. "Yeni dağıtım" yeni URL üretir; o zaman `config.js` güncellenmelidir.
- **URL gizli değildir** (yayınlanan sitede görünür). Kötüye kullanıma karşı betik yalnızca
  1–5 arası puanı kabul eder, metinleri kısaltır ve formül enjeksiyonunu engeller. Sahte kayıt
  görülürse Kayıt ID / Alınma zamanı ile ayıklanabilir; gerekirse yeni dağıtımla URL değiştirilir.
- **KVKK:** Ad toplandığı için kurumun KVKK birimiyle aydınlatma metni teyit edilmelidir.
  Ekrandaki kısa bilgilendirme metni **yer tutucudur**.
- Betik, dağıtımı yapan hesabın yetkisiyle yazar; o hesabın tabloda **düzenleme** yetkisi olmalıdır.
- Ortak tablodaki **diğer sayfalara dokunulmaz**; "OCinfo" sayfasının adı değiştirilirse betikteki
  `SHEET_NAME` de güncellenmeli ve yeni sürüm dağıtılmalıdır.
