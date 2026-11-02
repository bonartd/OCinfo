// Kullanım logu (docs/KULLANIM_LOGU.md): anonim etkileşim olayları iPad'de kuyruğa yazılır ve
// toplu olarak anket betiğinin adresine (tur: "log") gönderilir; betik anket e-tablosundaki
// "Kullanım Logu" sayfasına yazar. Kişisel veri, IP, konum KAYDEDİLMEZ.

const QUEUE_KEY = 'ocinfo-log-kuyruk';
const COUNTER_KEY = 'ocinfo-log-sayac';
const MAX_QUEUE = 2000;
const BATCH = 50;
const FLUSH_EVERY_MS = 5 * 60 * 1000;
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const SAYFA_ADLARI = { rezervasyon: '1 · Kurallar', anket: '2 · Anket', istatistik: '3 · Kullanım Bilgileri' };

let cfg = { endpoint: '', surum: '', cihaz: 'Kiosk (iPad)' };
let oturum = '—';
let oturumBas = 0;
let sayfa = '';
let flushing = false;

// ---- Kalıcı kuyruk (localStorage; erişilemezse bellekte) ----
let memory = [];
function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (e) { return memory; }
}
function writeQueue(q) {
  memory = q;
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) { /* bellekte kalır */ }
}

const pad = (n) => String(n).padStart(2, '0');
const tarih = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Günlük artan kiosk oturum numarası: K-AAGG-NNN
function nextSessionNo(now) {
  const bugun = tarih(now);
  let c;
  try { c = JSON.parse(localStorage.getItem(COUNTER_KEY) || 'null'); } catch (e) { c = null; }
  const n = c && c.tarih === bugun ? c.n + 1 : 1;
  try { localStorage.setItem(COUNTER_KEY, JSON.stringify({ tarih: bugun, n })); } catch (e) { /* yok say */ }
  return n;
}

export function sayfaAdi(id) {
  return SAYFA_ADLARI[id] || id;
}

export function initLog({ endpoint, surum, telefon }) {
  cfg = { endpoint, surum, cihaz: telefon ? 'Telefon' : 'Kiosk (iPad)' };
  if (telefon) {
    // Telefonda her açılış bir oturumdur (hareketsizlik sıfırlaması yok).
    const now = new Date();
    oturum = `T-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(16).slice(2, 6)}`;
    oturumBas = now.getTime();
  }
  window.addEventListener('online', () => flush());
  // Sayfa kapanırken / arka plana giderken bekleyenleri gönder.
  window.addEventListener('pagehide', () => flush(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
  setInterval(() => flush(), FLUSH_EVERY_MS);
  flush();
}

export function setSayfa(id) {
  sayfa = sayfaAdi(id);
}

// Bir olayı kuyruğa ekler. sistem: true ise oturuma bağlanmaz ("—").
export function log(olay, { ayrinti = '', sure = '', sistem = false, sayfa: s } = {}) {
  const now = new Date();
  const e = {
    id: now.getTime().toString(36) + Math.random().toString(36).slice(2, 7),
    tarih: tarih(now),
    saat: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    gun: GUNLER[now.getDay()],
    cihaz: cfg.cihaz,
    oturum: sistem ? '—' : oturum,
    olay,
    sayfa: s !== undefined ? s : (sistem ? '' : sayfa),
    ayrinti: String(ayrinti).slice(0, 200),
    sure: sure === '' ? '' : Math.round(sure),
    surum: cfg.surum,
  };
  let q = readQueue();
  q.push(e);
  if (q.length > MAX_QUEUE) {
    const atilan = q.length - MAX_QUEUE + 1;
    q = q.slice(atilan);
    q.unshift(Object.assign({}, e, {
      id: e.id + 'k', oturum: '—', olay: 'Kayıt kaybı', sayfa: '', sure: '',
      ayrinti: `Kuyruk doldu; en eski ${atilan} olay atıldı`,
    }));
  }
  writeQueue(q);
  if (q.length >= BATCH) flush();
}

// ---- Kiosk oturumu ----
export function oturumBasladi() {
  const now = new Date();
  oturum = `K-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(nextSessionNo(now)).padStart(3, '0')}`;
  oturumBas = now.getTime();
  log('Oturum başladı', { ayrinti: 'İlk dokunma' });
}

export function oturumBitti(idleSec) {
  if (oturum === '—') return;
  const etkin = Math.max(0, (Date.now() - oturumBas) / 1000 - idleSec);
  log('Oturum bitti', { ayrinti: `${idleSec} sn hareketsizlik → başa dönüldü`, sure: etkin });
  oturum = '—';
  flush();
}

// ---- Gönderim ----
// Yalnızca sunucu ok:true derse kuyruktan silinir. Aynı paket tekrar giderse betik paket
// kimliğiyle ayıklar. beacon=true: sayfa kapanırken (yanıt okunamaz, kuyruk korunur).
export async function flush(beacon) {
  if (!cfg.endpoint || flushing || !navigator.onLine) return;
  const q = readQueue();
  if (!q.length) return;
  const paket = q.slice(0, BATCH);
  const body = JSON.stringify({ tur: 'log', paket: paket[0].id + '-' + paket.length, olaylar: paket });
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(cfg.endpoint, new Blob([body], { type: 'text/plain;charset=utf-8' }));
    return;
  }
  flushing = true;
  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    const data = res.ok ? await res.json().catch(() => ({})) : {};
    if (data.ok === true) {
      const gonderilen = new Set(paket.map((e) => e.id));
      writeQueue(readQueue().filter((e) => !gonderilen.has(e.id)));
      if (readQueue().length >= BATCH) setTimeout(() => flush(), 1000);
    }
  } catch (err) {
    console.warn('Log gönderilemedi, kuyrukta bekliyor', err);
  } finally {
    flushing = false;
  }
}
