/**
 * OCinfo — Memnuniyet anketi alıcısı (Google Apps Script).
 *
 * Kurulum: docs/ANKET_KURULUM.md. Yalnızca anket için açılmış ayrı bir Google E-Tablosu'na
 * BAĞLI olarak çalışır (Uzantılar → Apps Script) ve web uygulaması olarak dağıtılır.
 * appsscript.json'daki "spreadsheets.currentonly" izni sayesinde betik yalnızca bağlı
 * olduğu bu tek dosyaya erişebilir; hesaptaki diğer tablolara erişemez.
 * iPad'deki OCinfo her yanıtı JSON olarak POST eder; betik SHEET_NAME sayfasına satır ekler.
 */

var SHEET_NAME = 'Yanıtlar';
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
    return json({ ok: false, error: 'kaydedilemedi' });
  } finally {
    lock.releaseLock();
  }
}

// Tarayıcıda adres açılınca çalıştığını gösterir (tablo içeriği hakkında bilgi vermez).
function doGet() {
  return json({ ok: true, mesaj: 'OCinfo anket uç noktası çalışıyor' });
}

// Kurulumda Apps Script düzenleyicisinden bir kez çalıştırın: izinleri ister ve
// "Yanıtlar" sayfasını başlık satırıyla hazırlar.
function kurulumTesti() {
  var sheet = getSheet();
  Logger.log('Tamam: "' + sheet.getName() + '" sayfası hazır, ' + sheet.getLastRow() + ' satır');
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Yeni açılmış tablodaki boş ilk sayfa yeniden adlandırılır; değilse yeni sayfa eklenir.
    var first = ss.getSheets()[0];
    if (ss.getSheets().length === 1 && first.getLastRow() === 0) {
      sheet = first.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    // Tarih/saat/ad/görüş/ID metin olarak kalsın (otomatik biçim dönüştürmesin).
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
