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
var HEADERS = ['Tarih', 'Saat', 'Bölüm', 'Puan (1-5)', 'Memnuniyet', 'Görüş ve öneri', 'Kayıt ID', 'Alınma zamanı', 'Not'];
// Tekrar gönderimleri ayıklamak için son kaç satırın ID'si kontrol edilir.
var DEDUPE_ROWS = 500;
// Kötüye kullanıma karşı: LIMIT_WINDOW_MIN dakikada en fazla LIMIT_MAX kayıt kabul edilir.
// Kiosk 60 sn kuralıyla 10 dakikada en fazla ~10 yanıt üretir; fazlası çevrimdışı birikmiş
// yanıtlar içindir. Sınır dolunca iPad kaydı kuyrukta tutar ve sonra yeniden dener.
var LIMIT_WINDOW_MIN = 10;
var LIMIT_MAX = 60;
// iPad saatine göre bir önceki yanıttan bu kadar saniyeden kısa sürede gelen yanıt
// "şüpheli" olarak işaretlenir (silinmez).
var SUSPICIOUS_SEC = 55;

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
    if (!takeQuota()) {
      return json({ ok: false, error: 'limit' });
    }

    var tarih = clean(data.tarih, 10);
    var saat = clean(data.saat, 8);
    sheet.appendRow([
      tarih,
      saat,
      clean(data.bolum, 80),
      puan,
      clean(data.memnuniyet, 40),
      clean(data.gorus, 500),
      clean(data.id, 40),
      new Date(),
      suspiciousNote(sheet, tarih, saat),
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

// Kurulumda ve her güncellemede Apps Script düzenleyicisinden bir kez çalıştırın:
// izinleri ister, "Yanıtlar" sayfasını hazırlar ve başlık satırını günceller.
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
  ensureHeaders(sheet);
  return sheet;
}

// Başlık satırı HEADERS ile aynı değilse yeniden yazılır (sütun düzeni değiştiğinde).
function ensureHeaders(sheet) {
  var range = sheet.getRange(1, 1, 1, HEADERS.length);
  if (range.getValues()[0].join('|') === HEADERS.join('|')) return;
  range.setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  // Tarih/saat/bölüm/görüş/ID metin olarak kalsın (otomatik biçim dönüştürmesin).
  sheet.getRange('A:C').setNumberFormat('@');
  sheet.getRange('F:G').setNumberFormat('@');
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

// Zaman penceresi başına sayaç (CacheService; ek izin gerektirmez).
function takeQuota() {
  var cache = CacheService.getScriptCache();
  var bucket = 'kota-' + Math.floor(Date.now() / (LIMIT_WINDOW_MIN * 60000));
  var used = Number(cache.get(bucket) || 0);
  if (used >= LIMIT_MAX) return false;
  cache.put(bucket, String(used + 1), LIMIT_WINDOW_MIN * 60 + 60);
  return true;
}

// iPad saatine göre son satırla arasındaki fark çok kısaysa not düşer.
function suspiciousNote(sheet, tarih, saat) {
  var last = sheet.getLastRow();
  if (last < 2) return '';
  var prev = sheet.getRange(last, 1, 1, 2).getDisplayValues()[0];
  var a = toTime(prev[0], prev[1]);
  var b = toTime(tarih, saat);
  if (isNaN(a) || isNaN(b)) return '';
  return Math.abs(b - a) < SUSPICIOUS_SEC * 1000 ? 'şüpheli: önceki yanıta çok yakın' : '';
}

function toTime(tarih, saat) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(tarih));
  var t = /^(\d{2}):(\d{2}):(\d{2})$/.exec(String(saat));
  if (!m || !t) return NaN;
  return new Date(+m[1], +m[2] - 1, +m[3], +t[1], +t[2], +t[3]).getTime();
}

// E-tablo formül enjeksiyonunu önle (=, +, -, @ ile başlayan metinler).
function clean(value, max) {
  var s = String(value == null ? '' : value).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
