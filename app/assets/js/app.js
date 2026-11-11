// OCinfo giriş noktası: sayfaları kurar, döndürücüyü ve hareketsizlik zamanlayıcısını bağlar.
import { config } from './config.js';
import { createIdleTimer } from './idle.js';
import { createRotator } from './rotator.js';
import rezervasyon from './pages/rezervasyon.js';
import anket, { bekleyenYanit } from './pages/anket.js';
import istatistik from './pages/istatistik.js';
import ekipman from './pages/ekipman.js';
import {
  initLog, log, setSayfa, sayfaAdi, oturumBasladi, oturumBitti,
} from './log.js';

// Yeni sayfa eklemek için: pages/ altına modül yazın ve bu listeye ekleyin.
const PAGE_MODULES = [rezervasyon, anket, ekipman, istatistik];

// Üst sekmelerdeki kısa ad ve simge (sayfa id'sine göre).
const ico = (d) => `<svg class="tab-ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const SEKMELER = {
  rezervasyon: { ad: 'Kurallar', ikon: ico('<path d="M9 4h6v3H9zM7 5.5H5.5v15h13v-15H17M8.5 11h7M8.5 14.5h7M8.5 18h4"/>') },
  anket: { ad: 'Anket', ikon: ico('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5a4.5 4.5 0 007 0M9.2 9.6h.01M14.8 9.6h.01"/>') },
  ekipman: { ad: 'Yeni ekipmanlar', ikon: ico('<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>') },
  istatistik: { ad: 'Kullanım bilgileri', ikon: ico('<path d="M4 20h16M7 20v-6M12 20V6M17 20v-9"/>') },
};

const stage = document.getElementById('stage');
const tabs = document.getElementById('tabs');
const clock = document.getElementById('clock');
const offline = document.getElementById('offline');

// Telefonda (ekranın kısa kenarı küçük) kiosk davranışları kapalıdır: otomatik sayfa geçişi,
// hareketsizlikte başa dönme ve gece yenilemesi yok; sayfalar .is-phone ile kendini uyarlar.
// iPad kiosk her yönde kısa kenarı ≥ 768 olduğundan etkilenmez.
const isPhone = Math.min(screen.width, screen.height) < config.phoneMaxShortSide;
document.documentElement.classList.toggle('is-phone', isPhone);

// Kullanım logu (docs/KULLANIM_LOGU.md) — anketle aynı uç nokta.
initLog({ endpoint: config.surveyEndpoint, surum: config.appVersion, telefon: isPhone });

async function init() {
  const pages = [];
  for (const mod of PAGE_MODULES) {
    const el = document.createElement('section');
    el.className = 'page';
    el.id = 'page-' + mod.id;
    el.setAttribute('aria-label', mod.title);
    stage.appendChild(el);
    try {
      await mod.render(el, config);
    } catch (err) {
      console.error(mod.id, err);
      el.innerHTML = '<p class="page-error">Bu bölüm şu anda yüklenemedi.</p>';
    }
    const sekme = SEKMELER[mod.id] || { ad: mod.title };
    pages.push({
      id: mod.id, title: mod.title, sekme: sekme.ad, ikon: sekme.ikon,
      durationSec: mod.durationSec, reset: mod.reset, el,
    });
  }

  const rotator = createRotator({
    pages, stage, tabs, defaultSec: config.rotationSec,
    onChange: (prev, next, neden) => {
      setSayfa(next.id);
      // Boşta otomatik geçişler ve başa dönüş kaydedilmez; yalnızca kullanıcının geçişleri.
      if (neden === 'sekme' || neden === 'kaydırma') {
        log('Sayfa değişti', { ayrinti: `${sayfaAdi(prev.id)} → ${sayfaAdi(next.id)} (${neden})` });
      }
    },
  });
  setSayfa(pages[0].id);

  if (isPhone) {
    const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    log('Uygulama açıldı', { ayrinti: standalone ? 'Ana ekran (PWA)' : 'Tarayıcı' });
    // Yalnızca saat ve rozet; sayfalar arasında sekmeler ve kaydırma ile geçilir.
    setInterval(() => { updateClock(); updateOnline(); }, 1000);
    updateClock();
    return;
  }

  log('Uygulama açıldı', { sistem: true, ayrinti: 'Kiosk' });

  const idle = createIdleTimer({
    timeoutSec: config.idleTimeoutSec,
    onActive: () => {
      rotator.stop();
      oturumBasladi();
    },
    onIdle: () => {
      pages.forEach((p) => {
        p.el.scrollTop = 0;
        // Sayfa yarım kalan durumu (ör. anket formu) temizlesin (yarım anket oturuma yazılır).
        if (p.reset) p.reset();
      });
      oturumBitti(config.idleTimeoutSec);
      // Ana sayfaya dönülmez; otomatik geçiş bulunulan sayfadan devam eder.
      rotator.start();
    },
  });
  rotator.start();

  // Arka plandan dönüşte (ör. Güdümlü Erişim dışında uygulama değiştirilirse) ana sayfaya dön.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') idle.reset();
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) idle.reset(); });

  const reloadAt = nextReloadTime(config.nightlyReloadHour);

  // Tek sayaç: saat, hareketsizlik ve gece yenilemesi.
  setInterval(() => {
    idle.tick();
    updateClock();
    updateOnline();
    if (reloadAt && Date.now() >= reloadAt && idle.isIdle()) {
      log('Gece yenilemesi', { sistem: true, ayrinti: `Uygulama ${String(config.nightlyReloadHour).padStart(2, '0')}:00'te kendini yeniledi` });
      location.reload();
    }
  }, 1000);
  updateClock();
}

function nextReloadTime(hour) {
  if (hour === null || hour === undefined) return null;
  const t = new Date();
  t.setHours(hour, 0, 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
  return t.getTime();
}

const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
let lastClock = '';

function updateClock() {
  const now = new Date();
  const text = timeFmt.format(now);
  if (text === lastClock) return;
  lastClock = text;
  clock.innerHTML = '<span class="clock-time">' + text + '</span>'
    + '<span class="clock-date">' + dateFmt.format(now) + '</span>';
}

// Üst çubuk rozeti: çevrimdışıyken ya da gönderilmeyi bekleyen anket yanıtı varken görünür.
// Ofis personeli iPad'i sıfırlamadan / uygulamayı silmeden önce bekleyen veri var mı görebilir.
function updateOnline() {
  const n = bekleyenYanit();
  const online = navigator.onLine;
  offline.hidden = online && n === 0;
  offline.classList.toggle('offline--sending', online);
  const text = !online ? (n ? `Çevrimdışı · ${n} yanıt bekliyor` : 'Çevrimdışı') : `${n} yanıt gönderiliyor`;
  if (offline.textContent !== text) offline.textContent = text;
}
let offlineSince = 0;
window.addEventListener('online', () => {
  updateOnline();
  const sn = offlineSince ? (Date.now() - offlineSince) / 1000 : 0;
  offlineSince = 0;
  log('Bağlantı geldi', { sistem: true, sure: sn, ayrinti: `${Math.round(sn / 60)} dk çevrimdışı; bekleyen kayıtlar gönderiliyor` });
});
window.addEventListener('offline', () => {
  updateOnline();
  offlineSince = Date.now();
  log('Bağlantı koptu', { sistem: true, ayrinti: 'Çevrimdışı rozeti gösterildi' });
});
updateOnline();

// iOS: iki parmakla yakınlaştırmayı engelle (kiosk).
document.addEventListener('gesturestart', (e) => e.preventDefault());

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW kaydı başarısız', err));
}

init();
