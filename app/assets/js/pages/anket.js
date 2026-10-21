// Sayfa 2 — Memnuniyet anketi: gülen yüzlerle puan + isteğe bağlı ad ve görüş.
// Yanıtlar önce iPad'de kuyruğa yazılır, sonra config.surveyEndpoint'e (Google Apps Script)
// gönderilir. Bağlantı yoksa kuyrukta bekler (AGENTS.md 3.4).

const QUEUE_KEY = 'ocinfo-anket-kuyruk';
const THANKS_SEC = 6;
const FLUSH_EVERY_SEC = 60;

const LEVELS = [
  { puan: 1, metin: 'Hiç memnun değilim', renk: '#e5484d', agiz: 'M30 70 Q50 52 70 70' },
  { puan: 2, metin: 'Memnun değilim', renk: '#f76b15', agiz: 'M32 68 Q50 60 68 68' },
  { puan: 3, metin: 'Kararsızım', renk: '#f2b50b', agiz: 'M32 65 L68 65' },
  { puan: 4, metin: 'Memnunum', renk: '#7cbf3f', agiz: 'M32 62 Q50 72 68 62' },
  { puan: 5, metin: 'Çok memnunum', renk: '#2f9e5b', agiz: 'M28 58 Q50 84 72 58' },
];

function face(level) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="${level.renk}"/>
    <circle cx="35" cy="40" r="6" fill="#1d2433"/>
    <circle cx="65" cy="40" r="6" fill="#1d2433"/>
    <path d="${level.agiz}" fill="none" stroke="#1d2433" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

// ---- Kuyruk (localStorage; erişilemezse bellekte) ----
let memoryQueue = [];

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch (e) {
    return memoryQueue;
  }
}

function writeQueue(q) {
  memoryQueue = q;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) { /* bellekte kalır */ }
}

let flushing = false;

async function flush(endpoint) {
  if (!endpoint || flushing || !navigator.onLine) return;
  flushing = true;
  try {
    for (;;) {
      const q = readQueue();
      if (!q.length) break;
      const entry = q[0];
      // text/plain: CORS ön isteği (preflight) gerektirmez; Apps Script JSON olarak ayrıştırır.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) break;
      // Aynı kaydın tekrar gönderilmesi sorun değil: betik "id" ile tekrarı ayıklar.
      writeQueue(readQueue().filter((e) => e.id !== entry.id));
    }
  } catch (err) {
    console.warn('Anket gönderilemedi, kuyrukta bekliyor', err);
  } finally {
    flushing = false;
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

function makeEntry(level, ad, gorus) {
  const now = new Date();
  return {
    id: now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    tarih: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    saat: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    ad: ad.trim().slice(0, 60),
    puan: level.puan,
    memnuniyet: level.metin,
    gorus: gorus.trim().slice(0, 500),
  };
}

let resetView = () => {};

export default {
  id: 'anket',
  title: 'Memnuniyet anketi',

  async render(el, config) {
    el.innerHTML = `
      <div class="sv">
        <div class="sv-step sv-step--rate is-active">
          <p class="eyebrow">Görüşün bizim için değerli</p>
          <h2 class="sv-question">Ödünç Cihaz Ofisi'nin hizmetlerinden memnun musun?</h2>
          <ul class="sv-faces">
            ${LEVELS.map((l) => `
              <li>
                <button type="button" class="sv-face" data-puan="${l.puan}" aria-label="${l.metin}">
                  ${face(l)}
                  <span>${l.metin}</span>
                </button>
              </li>`).join('')}
          </ul>
          <p class="sv-hint">Bir yüze dokunarak puan ver.</p>
        </div>

        <form class="sv-step sv-step--detail card" autocomplete="off" novalidate>
          <div class="sv-picked"></div>
          <label class="sv-field">
            <span>Görüş ve önerilerin <em>(isteğe bağlı)</em></span>
            <textarea name="gorus" rows="4" maxlength="500"
              placeholder="Hizmetimizi nasıl daha iyi hâle getirebiliriz?"></textarea>
          </label>
          <label class="sv-field">
            <span>Adın <em>(isteğe bağlı)</em></span>
            <input name="ad" type="text" maxlength="60" autocapitalize="words" autocorrect="off"
              spellcheck="false" placeholder="Ad Soyad">
          </label>
          <p class="sv-privacy">Adını yazmak zorunlu değildir. Yanıtlar yalnızca hizmet kalitesini
            değerlendirmek için kullanılır.</p>
          <div class="sv-actions">
            <button type="button" class="btn btn--ghost" data-action="back">Geri</button>
            <button type="submit" class="btn btn--primary">Gönder</button>
          </div>
        </form>

        <div class="sv-step sv-step--thanks" role="status">
          <div class="sv-thanks-face"></div>
          <h2 class="sv-question">Teşekkürler!</h2>
          <p class="sv-hint">Yanıtın kaydedildi.</p>
        </div>
      </div>`;

    const steps = {
      rate: el.querySelector('.sv-step--rate'),
      detail: el.querySelector('.sv-step--detail'),
      thanks: el.querySelector('.sv-step--thanks'),
    };
    const form = steps.detail;
    const picked = el.querySelector('.sv-picked');
    const thanksFace = el.querySelector('.sv-thanks-face');
    let level = null;
    let thanksTimer = null;

    function go(name) {
      Object.keys(steps).forEach((k) => steps[k].classList.toggle('is-active', k === name));
      el.scrollTop = 0;
    }

    resetView = () => {
      clearTimeout(thanksTimer);
      if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
      form.reset();
      level = null;
      go('rate');
    };

    el.querySelector('.sv-faces').addEventListener('click', (e) => {
      const btn = e.target.closest('.sv-face');
      if (!btn) return;
      level = LEVELS[Number(btn.dataset.puan) - 1];
      picked.innerHTML = face(level) + `<span>${level.metin}</span>`;
      picked.style.color = level.renk;
      go('detail');
    });

    form.querySelector('[data-action="back"]').addEventListener('click', resetView);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!level) return;
      const entry = makeEntry(level, form.elements.ad.value, form.elements.gorus.value);
      writeQueue(readQueue().concat(entry));
      flush(config.surveyEndpoint);
      if (document.activeElement) document.activeElement.blur();
      thanksFace.innerHTML = face(level);
      go('thanks');
      thanksTimer = setTimeout(resetView, THANKS_SEC * 1000);
    });

    // Bekleyen yanıtları düzenli aralıkla ve bağlantı gelince gönder (tek zamanlayıcı).
    window.addEventListener('online', () => flush(config.surveyEndpoint));
    setInterval(() => flush(config.surveyEndpoint), FLUSH_EVERY_SEC * 1000);
    flush(config.surveyEndpoint);
  },

  // Hareketsizlikte (app.js) ilk adıma dön ve yarım kalan yanıtı temizle.
  reset() {
    resetView();
  },
};
