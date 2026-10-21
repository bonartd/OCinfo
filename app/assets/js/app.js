// OCinfo giriş noktası: sayfaları kurar, döndürücüyü ve hareketsizlik zamanlayıcısını bağlar.
import { config } from './config.js';
import { createIdleTimer } from './idle.js';
import { createRotator } from './rotator.js';
import rezervasyon from './pages/rezervasyon.js';
import anket from './pages/anket.js';

// Yeni sayfa eklemek için: pages/ altına modül yazın ve bu listeye ekleyin.
const PAGE_MODULES = [rezervasyon, anket];

const stage = document.getElementById('stage');
const dots = document.getElementById('dots');
const clock = document.getElementById('clock');
const offline = document.getElementById('offline');

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
    pages.push({ id: mod.id, title: mod.title, durationSec: mod.durationSec, reset: mod.reset, el });
  }

  const rotator = createRotator({ pages, stage, dots, defaultSec: config.rotationSec });

  const idle = createIdleTimer({
    timeoutSec: config.idleTimeoutSec,
    onActive: () => rotator.stop(),
    onIdle: () => {
      pages.forEach((p) => {
        p.el.scrollTop = 0;
        // Sayfa yarım kalan durumu (ör. anket formu) temizlesin.
        if (p.reset) p.reset();
      });
      rotator.home();
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
    if (reloadAt && Date.now() >= reloadAt && idle.isIdle()) location.reload();
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

function updateOnline() {
  offline.hidden = navigator.onLine;
}
window.addEventListener('online', updateOnline);
window.addEventListener('offline', updateOnline);
updateOnline();

// iOS: iki parmakla yakınlaştırmayı engelle (kiosk).
document.addEventListener('gesturestart', (e) => e.preventDefault());

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW kaydı başarısız', err));
}

init();
