/**
 * OCinfo — Memnuniyet anketi alıcısı (Google Apps Script).
 *
 * Kurulum: docs/ANKET_KURULUM.md. BAĞIMSIZ bir Apps Script projesi olarak çalışır
 * (e-tabloya bağlı değildir; ortak tablodaki başka betiklerle çakışmaz) ve web uygulaması
 * olarak dağıtılır. iPad'deki OCinfo her yanıtı JSON olarak POST eder; betik yalnızca
 * SHEET_NAME sayfasına satır ekler, tablodaki diğer sayfalara dokunmaz.
 *
 * Tablo kimliği depoya yazılmaz: Proje Ayarları → Komut dosyası özellikleri →
 * SPREADSHEET_ID = (tablo adresindeki /d/ ile /edit arasındaki kısım).
 */

var SHEET_NAME = 'OCinfo';
var HEADERS = ['Tarih', 'Saat', 'Kullanıcı adı', 'Puan (1-5)', 'Memnuniyet', 'Görüş ve öneri', 'Kayıt ID', 'Alınma zamanı'];
// Tekrar gönderimleri ayıklamak için son kaç satırın ID'si kontrol edilir.
var DEDUPE_ROWS = 500;

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var puan = Number(data.puan);
    if (!(puan >= 1 && puan <= 5) || !data.id) {
      return json({ ok: false, error: 'geçersiz veri' });
    }

    var sheet = getSheet();
    if (isDuplicate(sheet, String(data.id))) {
      return json({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      clean(data.tarih, 10),
      clean(data.saat, 8),
      clean(data.ad, 60),
      puan,
      clean(data.memnuniyet, 40),
      clean(data.gorus, 500),
      clean(data.id, 40),
      new Date(),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Tarayıcıda adres açılınca çalıştığını ve tabloya erişebildiğini gösterir.
function doGet() {
  try {
    var sheet = getSheet();
    return json({ ok: true, mesaj: 'OCinfo anket uç noktası çalışıyor', sayfa: sheet.getName(), satir: sheet.getLastRow() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Kurulumda Apps Script düzenleyicisinden bir kez çalıştırın: izinleri ister ve
// "OCinfo" sayfasına başlık satırını yazar (sayfa boşsa).
function kurulumTesti() {
  var sheet = getSheet();
  Logger.log('Tamam: "' + sheet.getName() + '" sayfası, ' + sheet.getLastRow() + ' satır');
}

function getSheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID komut dosyası özelliği tanımlı değil');
  var sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  // Ortak tabloda yeni sayfa açılmaz; sayfa yoksa hata verilir.
  if (!sheet) throw new Error('"' + SHEET_NAME + '" sayfası bulunamadı');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    // Tarih/saat/ad/görüş metin olarak kalsın (otomatik biçim dönüştürmesin).
    sheet.getRange('A:C').setNumberFormat('@');
    sheet.getRange('F:G').setNumberFormat('@');
  }
  return sheet;
}

function isDuplicate(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var start = Math.max(2, last - DEDUPE_ROWS + 1);
  var ids = sheet.getRange(start, 7, last - start + 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return true;
  }
  return false;
}

// E-tablo formül enjeksiyonunu önle (=, +, -, @ ile başlayan metinler).
function clean(value, max) {
  var s = String(value == null ? '' : value).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
