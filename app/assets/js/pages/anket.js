// Sayfa 2 — Memnuniyet anketi: gülen yüzlerle puan + zorunlu bölüm + isteğe bağlı görüş.
// Yanıtlar anonimdir. Önce iPad'de kuyruğa yazılır, sonra config.surveyEndpoint'e
// (Google Apps Script) gönderilir. Bağlantı yoksa kuyrukta bekler (AGENTS.md 3.4).
// Arka arkaya yanıtı zorlaştırmak için gönderimden sonra config.surveyCooldownSec
// boyunca yeni yanıt alınmaz.

const QUEUE_KEY = 'ocinfo-anket-kuyruk';
const COOLDOWN_KEY = 'ocinfo-anket-son-gonderim';
const FLUSH_EVERY_SEC = 60;

const LEVELS = [
  { puan: 1, metin: 'Hiç memnun değilim', renk: '#e5484d', agiz: 'M30 70 Q50 52 70 70' },
  { puan: 2, metin: 'Memnun değilim', renk: '#f76b15', agiz: 'M32 68 Q50 60 68 68' },
  { puan: 3, metin: 'Kararsızım', renk: '#f2b50b', agiz: 'M32 65 L68 65' },
  { puan: 4, metin: 'Memnunum', renk: '#7cbf3f', agiz: 'M32 62 Q50 72 68 62' },
  { puan: 5, metin: 'Çok memnunum', renk: '#2f9e5b', agiz: 'M28 58 Q50 84 72 58' },
];

const BOLUMLER = [
  'Radyo, Televizyon ve Sinema',
  'Görsel İletişim Tasarımı',
  'Yeni Medya ve İletişim',
  'Halkla İlişkiler ve Reklamcılık',
  'Çizgi Film ve Animasyon',
  'Endüstriyel Tasarım',
];
const DIGER = 'Diğer';

const CHECK = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="#2f9e5b"/>
  <path d="M30 52 L44 66 L72 36" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function face(level) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="${level.renk}"/>
    <circle cx="35" cy="40" r="6" fill="#1d2433"/>
    <circle cx="65" cy="40" r="6" fill="#1d2433"/>
    <path d="${level.agiz}" fill="none" stroke="#1d2433" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}

// ---- Kalıcı küçük durum (localStorage; erişilemezse bellekte) ----
const memory = {};

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) {
    return key in memory ? memory[key] : fallback;
  }
}

function save(key, value) {
  memory[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* bellekte kalır */ }
}

const readQueue = () => load(QUEUE_KEY, []);
const writeQueue = (q) => save(QUEUE_KEY, q);

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
      const body = await res.json().catch(() => ({ ok: true }));
      // Sunucu sınırı doldu: kayıt kuyrukta kalır, sonraki denemede gönderilir.
      if (body.ok === false && body.error === 'limit') break;
      // Başarılı, tekrar (duplicate) veya geçersiz: kuyruktan çıkar.
      writeQueue(readQueue().filter((e) => e.id !== entry.id));
    }
  } catch (err) {
    console.warn('Anket gönderilemedi, kuyrukta bekliyor', err);
  } finally {
    flushing = false;
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

function makeEntry(level, bolum, gorus) {
  const now = new Date();
  return {
    id: now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    tarih: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    saat: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    bolum: bolum.trim().slice(0, 80),
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
    const cooldownMs = (config.surveyCooldownSec || 0) * 1000;

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
            <textarea name="gorus" rows="3" maxlength="500"
              placeholder="Hizmetimizi nasıl daha iyi hâle getirebiliriz?"></textarea>
          </label>
          <fieldset class="sv-field sv-dept">
            <legend>Bölümün</legend>
            <div class="sv-chips">
              ${BOLUMLER.concat(DIGER).map((b) => `
                <button type="button" class="sv-chip" data-bolum="${b}" aria-pressed="false">${b}</button>`).join('')}
            </div>
            <input name="diger" type="text" maxlength="80" autocorrect="off" spellcheck="false"
              placeholder="Bölümünü yaz" hidden>
          </fieldset>
          <p class="sv-privacy">Yanıtlar anonimdir.</p>
          <div class="sv-actions">
            <button type="button" class="btn btn--ghost" data-action="back">Geri</button>
            <button type="submit" class="btn btn--primary" disabled>Gönder</button>
          </div>
          <p class="sv-required" aria-live="polite">Göndermek için bölümünü seç.</p>
        </form>

        <div class="sv-step sv-step--thanks" role="status">
          <div class="sv-thanks-face"></div>
          <h2 class="sv-question">Teşekkürler!</h2>
          <p class="sv-hint">Yanıtın kaydedildi.</p>
          <p class="sv-wait"></p>
        </div>
      </div>`;

    const steps = {
      rate: el.querySelector('.sv-step--rate'),
      detail: el.querySelector('.sv-step--detail'),
      thanks: el.querySelector('.sv-step--thanks'),
    };
    const form = steps.detail;
    const picked = el.querySelector('.sv-picked');
    const chips = Array.from(el.querySelectorAll('.sv-chip'));
    const digerInput = form.elements.diger;
    const thanksFace = el.querySelector('.sv-thanks-face');
    const waitText = el.querySelector('.sv-wait');
    const submitBtn = form.querySelector('button[type="submit"]');
    const requiredText = el.querySelector('.sv-required');
    let level = null;
    let bolum = '';
    let waitTimer = null;

    function go(name) {
      Object.keys(steps).forEach((k) => steps[k].classList.toggle('is-active', k === name));
      el.scrollTop = 0;
    }

    function remainingMs() {
      return Math.max(0, load(COOLDOWN_KEY, 0) + cooldownMs - Date.now());
    }

    // Bölüm zorunludur; "Diğer" seçilirse bölüm adı da yazılmalıdır.
    function bolumValid() {
      return bolum !== '' && (bolum !== DIGER || digerInput.value.trim() !== '');
    }

    function updateSubmit() {
      const ok = bolumValid();
      submitBtn.disabled = !ok;
      requiredText.hidden = ok;
      requiredText.textContent = bolum === DIGER ? 'Göndermek için bölümünün adını yaz.' : 'Göndermek için bölümünü seç.';
    }

    function selectBolum(value) {
      bolum = bolum === value ? '' : value;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.bolum === bolum)));
      digerInput.hidden = bolum !== DIGER;
      if (bolum !== DIGER) digerInput.value = '';
      updateSubmit();
    }

    // Bekleme süresi boyunca teşekkür ekranı kalır; kalan süre her saniye güncellenir.
    function showCooldown() {
      clearTimeout(waitTimer);
      const ms = remainingMs();
      if (ms <= 0) {
        go('rate');
        return;
      }
      waitText.textContent = `Yeni yanıt ${Math.ceil(ms / 1000)} sn sonra alınabilir.`;
      // Yeniden yüklemeden sonra seçilen yüz bilinmez; onay işareti gösterilir.
      if (!thanksFace.innerHTML) thanksFace.innerHTML = CHECK;
      go('thanks');
      waitTimer = setTimeout(showCooldown, Math.min(1000, ms));
    }

    resetView = () => {
      clearTimeout(waitTimer);
      if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
      form.reset();
      selectBolum('');
      level = null;
      showCooldown();
    };

    el.querySelector('.sv-faces').addEventListener('click', (e) => {
      const btn = e.target.closest('.sv-face');
      if (!btn) return;
      if (remainingMs() > 0) {
        showCooldown();
        return;
      }
      level = LEVELS[Number(btn.dataset.puan) - 1];
      picked.innerHTML = face(level) + `<span>${level.metin}</span>`;
      picked.style.color = level.renk;
      go('detail');
    });

    el.querySelector('.sv-chips').addEventListener('click', (e) => {
      const chip = e.target.closest('.sv-chip');
      if (chip) selectBolum(chip.dataset.bolum);
    });

    digerInput.addEventListener('input', updateSubmit);

    form.querySelector('[data-action="back"]').addEventListener('click', resetView);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!level || remainingMs() > 0 || !bolumValid()) return;
      const digerText = digerInput.value.trim();
      const bolumValue = bolum === DIGER ? (digerText ? `${DIGER}: ${digerText}` : DIGER) : bolum;
      const entry = makeEntry(level, bolumValue, form.elements.gorus.value);
      writeQueue(readQueue().concat(entry));
      save(COOLDOWN_KEY, Date.now());
      flush(config.surveyEndpoint);
      if (document.activeElement) document.activeElement.blur();
      thanksFace.innerHTML = face(level);
      form.reset();
      selectBolum('');
      level = null;
      showCooldown();
    });

    // Bekleme sürerken açılırsa (ör. yeniden yükleme) doğrudan teşekkür ekranı.
    showCooldown();

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
