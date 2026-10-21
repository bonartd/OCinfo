# Memnuniyet Anketi — Google Drive Kurulumu

OCinfo'nun 2. sayfasındaki memnuniyet anketi, yanıtları **yalnızca bu iş için açılmış ayrı bir
Google E-Tablosu**na yazar (sayfa adı: **"Yanıtlar"**). Tablo istenildiği an **Excel (.xlsx)**
olarak indirilebilir.

> Tablonun adresi/kimliği depo herkese açık olduğu için buraya yazılmaz; ekip içinde paylaşılır.
> Betik tabloya bağlı çalıştığından kimliğe kodda ihtiyaç yoktur.

## Neden ayrı tablo ve tabloya bağlı betik?

- Betik `spreadsheets.currentonly` izniyle çalışır: **yalnızca bağlı olduğu bu tek dosyaya**
  erişebilir, hesaptaki diğer tablolara erişemez.
- Öğrenci adları ve görüşleri, başka projelerin ortak tablolarında değil, erişimi ayrıca
  yönetilebilen ayrı bir dosyada tutulur (KVKK).
- Yanıtlar başka bir tabloda da görülmek istenirse orada `IMPORTRANGE` ile yansıtılabilir.

## Toplanan sütunlar

| Tarih | Saat | Kullanıcı adı | Puan (1-5) | Memnuniyet | Görüş ve öneri | Kayıt ID | Alınma zamanı |
|---|---|---|---|---|---|---|---|
| 2026-10-21 | 12:34:05 | (boş olabilir) | 5 | Çok memnunum | … | lz3k…-a1b2c3 | (sunucu saati) |

- Başlık satırını betik yazar; sütunların sırasını değiştirmeyin.
- **Tarih/Saat:** Yanıtın iPad'de verildiği an (internet yokken verilen yanıtlar da doğru saatle gelir).
- **Kullanıcı adı ve görüş isteğe bağlıdır.** Öğrenci numarası, e-posta vb. istenmez.
- **Kayıt ID:** Aynı yanıtın iki kez yazılmasını önler; dokunmayın.

## Kurulum (bir kez, ~5 dakika)

1. Anket tablosunu açın → **Uzantılar → Apps Script**. Proje adını `OCinfo Anket` yapın.
2. Soldaki ⚙️ **Proje Ayarları** → **"appsscript.json" manifest dosyasını düzenleyicide göster**
   kutusunu işaretleyin.
3. Soldaki **Düzenleyici**'ye (‹ › simgesi) dönün:
   - `appsscript.json` dosyasının içeriğini silip depodaki
     [`tools/google-apps-script/appsscript.json`](../tools/google-apps-script/appsscript.json)
     içeriğini yapıştırın.
   - `Kod.gs` içeriğini silip depodaki
     [`tools/google-apps-script/anket.gs`](../tools/google-apps-script/anket.gs) içeriğini yapıştırın.
   - **Kaydet** (💾).
4. Üstteki işlev listesinden **`kurulumTesti`**'ni seçip **Çalıştır**. İzin isteyecek: hesabı seçin →
   "Gelişmiş" → "OCinfo Anket'e git (güvenli değil)" → **İzin ver**. İzin ekranında yalnızca
   *"Bu uygulamanın yüklü olduğu e-tabloları görüntüleme ve yönetme"* yazmalıdır (tüm tablolar
   değil). Günlükte `Tamam: "Yanıtlar" sayfası hazır…` görünür ve tabloda başlık satırı oluşur.
5. Sağ üstte **Dağıt → Yeni dağıtım** → ⚙️ tür: **Web uygulaması**
   - Açıklama: `OCinfo anket`
   - Şu kullanıcı olarak yürüt: **Ben**
   - Erişimi olan kullanıcılar: **Herkes**
   - **Dağıt**
6. Verilen **Web uygulaması URL'sini** (`https://script.google.com/macros/s/…/exec`) kopyalayın ve
   tarayıcıda açın: `{"ok":true,"mesaj":"OCinfo anket uç noktası çalışıyor"}` görmelisiniz.
7. URL'yi `app/assets/js/config.js` içindeki `surveyEndpoint` alanına yazın, commit + push edin
   (ya da URL'yi YZ aracınıza verip bu adımı ona yaptırın).

## Excel olarak indirme

Tablo açıkken **Dosya → İndir → Microsoft Excel (.xlsx)**.

## Güvenlik ve bilmeniz gerekenler

- **İzin sınırlı:** Betik yalnızca bağlı olduğu anket tablosuna erişir.
- **URL gizli değildir** (yayınlanan sitede görünür). Bu adresle tablodaki veriler **okunamaz,
  silinemez, değiştirilemez**; yalnızca yeni satır eklenebilir. Betik yalnızca 1–5 arası puanı
  kabul eder, metinleri kısaltır ve formül enjeksiyonunu engeller. Sahte kayıt görülürse
  Kayıt ID / Alınma zamanı ile ayıklanır; gerekirse yeni dağıtımla URL değiştirilir.
- **Erişim:** Tabloyu yalnızca anket sonuçlarını görmesi gereken kişilerle paylaşın.
- **KVKK:** Ad toplandığı için kurumun KVKK birimiyle aydınlatma metni teyit edilmelidir.
  Ekrandaki kısa bilgilendirme metni **yer tutucudur**.
- **Bağlantı yoksa:** Yanıtlar iPad'de saklanır; internet gelince (ve en geç 60 sn'de bir)
  otomatik gönderilir. `surveyEndpoint` boşken de yanıtlar iPad'de birikir, adres girilince gider.
- **Betiği değiştirirseniz:** Dağıt → Dağıtımları yönet → kalem simgesi → Sürüm: **Yeni sürüm** →
  Dağıt. Böylece URL değişmez. "Yeni dağıtım" yeni URL üretir; o zaman `config.js` güncellenmelidir.
- Betik, dağıtımı yapan hesabın yetkisiyle yazar; o hesabın tabloda düzenleme yetkisi olmalıdır.
