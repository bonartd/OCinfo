# Memnuniyet Anketi — Google Drive Kurulumu

OCinfo'nun 2. sayfasındaki memnuniyet anketi, yanıtları Google Drive'daki bir
**Google E-Tablosu**na yazar. Tablo istenildiği an **Excel (.xlsx)** olarak indirilebilir.

## Toplanan sütunlar

| Tarih | Saat | Kullanıcı adı | Puan (1-5) | Memnuniyet | Görüş ve öneri | Kayıt ID | Alınma zamanı |
|---|---|---|---|---|---|---|---|
| 2026-10-21 | 12:34:05 | (boş olabilir) | 5 | Çok memnunum | … | lz3k…-a1b2c3 | (sunucu saati) |

- **Tarih/Saat:** Yanıtın iPad'de verildiği an (internet yokken verilen yanıtlar da doğru saatle gelir).
- **Kullanıcı adı ve görüş isteğe bağlıdır.** Öğrenci numarası, e-posta vb. istenmez.
- **Kayıt ID:** Aynı yanıtın iki kez yazılmasını önler; dokunmayın.

## Kurulum (bir kez, ~5 dakika)

1. **Google Drive**'da yeni bir **Google E-Tablosu** oluşturun, adı: `OCinfo Memnuniyet Anketi`.
2. Tabloda **Uzantılar → Apps Script**'i açın.
3. Açılan düzenleyicideki `Kod.gs` içeriğini silin; depodaki
   [`tools/google-apps-script/anket.gs`](../tools/google-apps-script/anket.gs) dosyasının
   **tamamını** yapıştırın ve **Kaydet**'e basın.
4. Sağ üstte **Dağıt → Yeni dağıtım**:
   - Tür: **Web uygulaması**
   - Açıklama: `OCinfo anket`
   - Şu kullanıcı olarak yürüt: **Ben**
   - Erişimi olan kullanıcılar: **Herkes**
   - **Dağıt** → Google hesap izinlerini onaylayın ("Gelişmiş → … sayfasına git (güvenli değil)"
     uyarısı kendi betiğiniz için normaldir).
5. Verilen **Web uygulaması URL'sini** (`https://script.google.com/macros/s/…/exec`) kopyalayın.
6. URL'yi tarayıcıda açın: `{"ok":true,"mesaj":"OCinfo anket uç noktası çalışıyor"}` görmelisiniz.
7. URL'yi `app/assets/js/config.js` içindeki `surveyEndpoint` alanına yapıştırın, commit + push edin.
   (Ya da URL'yi YZ aracınıza verip bu adımı ona yaptırın.)

İlk yanıt geldiğinde tabloda **"Yanıtlar"** sayfası başlıklarıyla birlikte otomatik oluşur.

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
- Tablonun sahibi dağıtımı yapan hesaptır; ekip arkadaşlarıyla tabloyu Drive'dan paylaşabilirsiniz.
