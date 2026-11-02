/**
 * OCinfo — Memnuniyet anketi alıcısı (Google Apps Script).
 *
 * Kurulum: docs/ANKET_KURULUM.md. Yalnızca anket için açılmış ayrı bir Google E-Tablosu'na
 * BAĞLI olarak çalışır (Uzantılar → Apps Script) ve web uygulaması olarak dağıtılır.
 * appsscript.json'daki "spreadsheets.currentonly" izni sayesinde betik yalnızca bağlı
 * olduğu bu tek dosyaya erişebilir; hesaptaki diğer tablolara erişemez.
 * iPad'deki OCinfo her yanıtı JSON olarak POST eder; betik SHEET_NAME sayfasına satır ekler.
 *
 * Kullanım logu (docs/KULLANIM_LOGU.md): aynı adrese { tur: "log", paket, olaylar: [...] }
 * gelir; olaylar LOG_SHEET sayfasına yazılır. gunlukOzet() "Günlük Özet" ve "Saatlik Yoğunluk"
 * sayfalarını üretir (elle ya da günlük tetikleyiciyle çalıştırılır).
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

// ---- Kullanım logu ----
var LOG_SHEET = 'Kullanım Logu';
var LOG_HEADERS = ['Kayıt No', 'Tarih', 'Saat', 'Gün', 'Cihaz', 'Oturum', 'Olay', 'Sayfa', 'Ayrıntı',
  'Süre (sn)', 'Uygulama sürümü', 'Alınma zamanı'];
// Yalnızca bu olay türleri kabul edilir (uygulamadaki log.js ile aynı adlar).
var LOG_OLAYLAR = ['Oturum başladı', 'Oturum bitti', 'Sayfa değişti', 'Grafik seçildi', 'Yıl seçildi',
  'Çubuk seçildi', 'Anket: puan seçildi', 'Anket gönderildi', 'Anket yarıda bırakıldı', 'Uygulama açıldı',
  'Rezervasyon bağlantısı açıldı', 'Bağlantı koptu', 'Bağlantı geldi', 'Gece yenilemesi', 'Kayıt kaybı'];
var LOG_MAX_PER_PAKET = 100;
// Log paketleri için ayrı sınır: 10 dakikada en fazla 120 paket.
var LOG_LIMIT_MAX = 120;
var OZET_SHEET = 'Günlük Özet';
var SAATLIK_SHEET = 'Saatlik Yoğunluk';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    if (data && data.tur === 'log') return json(handleLog(data));
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
  var log = getLogSheet();
  Logger.log('Tamam: "' + log.getName() + '" sayfası hazır, ' + log.getLastRow() + ' satır');
}

// ---- Kullanım logu ----
function handleLog(data) {
  var olaylar = data.olaylar;
  var paket = String(data.paket || '');
  if (!paket || !Array.isArray(olaylar) || !olaylar.length || olaylar.length > LOG_MAX_PER_PAKET) {
    return { ok: false, error: 'geçersiz paket' };
  }
  var cache = CacheService.getScriptCache();
  var key = 'logpaket-' + paket.slice(0, 200);
  if (cache.get(key)) return { ok: true, duplicate: true };
  if (!takeQuota('logkota', LOG_LIMIT_MAX)) return { ok: false, error: 'limit' };

  var sheet = getLogSheet();
  var start = sheet.getLastRow() + 1;
  var now = new Date();
  var rows = [];
  olaylar.forEach(function (o) {
    if (!o || LOG_OLAYLAR.indexOf(String(o.olay)) === -1) return;
    var sure = Number(o.sure);
    rows.push([
      start + rows.length - 1,
      clean(o.tarih, 10),
      clean(o.saat, 8),
      clean(o.gun, 12),
      clean(o.cihaz, 20),
      clean(o.oturum, 20),
      clean(o.olay, 40),
      clean(o.sayfa, 40),
      clean(o.ayrinti, 200),
      o.sure === '' || isNaN(sure) ? '' : Math.round(sure),
      clean(o.surum, 20),
      now,
    ]);
  });
  if (rows.length) sheet.getRange(start, 1, rows.length, LOG_HEADERS.length).setValues(rows);
  cache.put(key, '1', 6 * 60 * 60);
  return { ok: true, yazilan: rows.length };
}

function getLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SHEET) || ss.insertSheet(LOG_SHEET);
  var range = sheet.getRange(1, 1, 1, LOG_HEADERS.length);
  if (range.getValues()[0].join('|') !== LOG_HEADERS.join('|')) {
    range.setValues([LOG_HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Tarih, saat, oturum metin olarak kalsın.
    sheet.getRange('B:C').setNumberFormat('@');
    sheet.getRange('F:F').setNumberFormat('@');
  }
  return sheet;
}

// "Günlük Özet" ve "Saatlik Yoğunluk" sayfalarını Kullanım Logu'ndan yeniden üretir.
// Elle çalıştırılabilir ya da Tetikleyiciler → Zamana dayalı → Gün zamanlayıcı ile her gün.
function gunlukOzet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = getLogSheet();
  var last = log.getLastRow();
  var rows = last > 1 ? log.getRange(2, 1, last - 1, LOG_HEADERS.length).getDisplayValues() : [];
  var gunler = {};
  var saatlik = {};
  var GUN_SIRA = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  rows.forEach(function (r) {
    var tarih = r[1], saat = r[2], gun = r[3], cihaz = r[4], olay = r[6], sayfa = r[7], ayrinti = r[8];
    var sure = Number(r[9]) || 0;
    var g = gunler[tarih] || (gunler[tarih] = {
      gun: gun, oturum: 0, sureTop: 0, sureSay: 0, telefon: 0, anket: 0, yarim: 0,
      sayfalar: {}, grafikler: {}, cevrimdisi: 0, yenileme: 0,
    });
    if (olay === 'Oturum başladı') {
      g.oturum++;
      g.sayfalar[sayfa] = (g.sayfalar[sayfa] || 0) + 1;
      var h = Number(String(saat).slice(0, 2));
      var k = h + '|' + gun;
      saatlik[k] = (saatlik[k] || 0) + 1;
    } else if (olay === 'Oturum bitti') { g.sureTop += sure; g.sureSay++; }
    else if (olay === 'Uygulama açıldı' && cihaz === 'Telefon') g.telefon++;
    else if (olay === 'Anket gönderildi') g.anket++;
    else if (olay === 'Anket yarıda bırakıldı') g.yarim++;
    else if (olay === 'Sayfa değişti') g.sayfalar[sayfa] = (g.sayfalar[sayfa] || 0) + 1;
    else if (olay === 'Grafik seçildi') g.grafikler[ayrinti] = (g.grafikler[ayrinti] || 0) + 1;
    else if (olay === 'Bağlantı geldi') g.cevrimdisi += sure;
    else if (olay === 'Gece yenilemesi') g.yenileme++;
  });

  function enCok(m) {
    var best = '—', n = 0;
    Object.keys(m).forEach(function (k) { if (m[k] > n) { best = k; n = m[k]; } });
    return best;
  }

  var ozet = [['Tarih', 'Gün', 'Kiosk oturumu', 'Ort. oturum süresi (sn)', 'Telefon ziyareti', 'Anket gönderimi',
    'Yarıda bırakılan anket', 'En çok açılan sayfa', 'En çok seçilen grafik', 'Çevrimdışı (dk)', 'Gece yenilemesi']];
  Object.keys(gunler).sort().forEach(function (t) {
    var g = gunler[t];
    ozet.push([t, g.gun, g.oturum, g.sureSay ? Math.round(g.sureTop / g.sureSay) : 0, g.telefon, g.anket, g.yarim,
      enCok(g.sayfalar), enCok(g.grafikler), Math.round(g.cevrimdisi / 60), g.yenileme ? 'var' : 'YOK']);
  });
  yaz(ss, OZET_SHEET, ozet, [1]);

  var tablo = [['Saat dilimi'].concat(GUN_SIRA.slice(0, 5)).concat(['Toplam'])];
  for (var h = 8; h < 19; h++) {
    var satir = GUN_SIRA.slice(0, 5).map(function (gun) { return saatlik[h + '|' + gun] || 0; });
    var top = satir.reduce(function (a, b) { return a + b; }, 0);
    tablo.push([(h < 10 ? '0' : '') + h + ':00–' + (h + 1 < 10 ? '0' : '') + (h + 1) + ':00'].concat(satir).concat([top]));
  }
  yaz(ss, SAATLIK_SHEET, tablo, [1]);
  Logger.log('Özet güncellendi: ' + (ozet.length - 1) + ' gün, ' + rows.length + ' olay');
}

function yaz(ss, ad, veri, metinSutunlar) {
  var sh = ss.getSheetByName(ad) || ss.insertSheet(ad);
  sh.clearContents();
  metinSutunlar.forEach(function (c) { sh.getRange(1, c, Math.max(veri.length, 1), 1).setNumberFormat('@'); });
  sh.getRange(1, 1, veri.length, veri[0].length).setValues(veri);
  sh.getRange(1, 1, 1, veri[0].length).setFontWeight('bold');
  sh.setFrozenRows(1);
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
function takeQuota(onek, max) {
  var cache = CacheService.getScriptCache();
  var bucket = (onek || 'kota') + '-' + Math.floor(Date.now() / (LIMIT_WINDOW_MIN * 60000));
  var used = Number(cache.get(bucket) || 0);
  if (used >= (max || LIMIT_MAX)) return false;
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
