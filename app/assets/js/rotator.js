// Sayfa döndürücü: sayfaları sırayla gösterir. Otomatik geçiş yalnızca kiosk boştayken
// çalışır; kullanıcı dokunurken durur. Geçiş yalnızca opacity/transform ile yapılır.

// onChange(önceki, sonraki, neden): neden 'sekme' | 'kaydırma' | 'otomatik' | 'sıfırlama'.
const KAYMA = 60; // sayfa geçişinde yatay kayma (px)
const ESIK = 50; // sayfa değiştiren en kısa yatay kaydırma (px)

export function createRotator({ pages, stage, tabs, defaultSec, onChange }) {
  let index = 0;
  let timer = null;
  let running = false;

  pages.forEach((page, i) => {
    page.el.classList.toggle('is-active', i === 0);
    page.el.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  });

  // Sekmeler (tarayıcı sekmesi gibi): ekranda birden çok sayfa olduğu ilk bakışta görünür.
  // Kapatma düğmesi yoktur; dokununca o sayfa açılır. Etkin sekmenin altındaki çizgi,
  // otomatik geçişte sonraki sayfaya kalan süreyi gösterir.
  tabs.hidden = pages.length < 2;
  tabs.innerHTML = '';
  const tabButtons = pages.map((page, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('aria-label', page.title);
    b.innerHTML = (page.ikon || '')
      + '<span class="tab-label">' + page.sekme + '</span>'
      + '<span class="tab-sure" aria-hidden="true"></span>';
    b.addEventListener('click', () => show(i, 'sekme'));
    tabs.appendChild(b);
    return b;
  });
  updateTabs();

  function updateTabs() {
    tabButtons.forEach((b, i) => {
      b.classList.toggle('is-active', i === index);
      if (i === index) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  // yon: 1 = ileri (yeni sayfa sağdan gelir), -1 = geri (soldan gelir), 0 = yerinde belirir.
  function show(i, neden, yon) {
    const next = (i + pages.length) % pages.length;
    if (next !== index) {
      const prev = index;
      if (yon === undefined) yon = neden === 'sıfırlama' ? 0 : (next > index ? 1 : -1);
      const giden = pages[index].el;
      const gelen = pages[next].el;
      // Kitap sayfası gibi: giden sayfa kayış yönünde çıkar, gelen karşı taraftan girer.
      giden.style.setProperty('--x', `${-yon * KAYMA}px`);
      gelen.style.transition = 'none';
      gelen.style.setProperty('--x', `${yon * KAYMA}px`);
      void gelen.offsetWidth; // başlangıç konumu uygulansın
      gelen.style.transition = '';
      giden.classList.remove('is-active');
      giden.setAttribute('aria-hidden', 'true');
      gelen.classList.add('is-active');
      pages[next].el.setAttribute('aria-hidden', 'false');
      pages[next].el.scrollTop = 0;
      index = next;
      updateTabs();
      if (onChange) onChange(pages[prev], pages[next], neden);
    }
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;
    tabButtons.forEach((b) => b.classList.remove('is-timing'));
    if (!running || pages.length < 2) return;
    const sec = pages[index].durationSec || defaultSec;
    const b = tabButtons[index];
    b.style.setProperty('--sure', sec + 's');
    void b.offsetWidth; // süre çizgisi baştan başlasın
    b.classList.add('is-timing');
    timer = setTimeout(() => show(index + 1, 'otomatik', 1), sec * 1000);
  }

  // Parmakla yatay kaydırma (kitap gibi): sağdan sola → sonraki, soldan sağa → önceki sayfa.
  // iPad'de pointer olayları sayfa dikey kaydırılınca iptal edildiği (pointercancel) için
  // dokunmada touch olayları, farede pointer olayları kullanılır. Hareket belirgin biçimde
  // yatay olmalı; dikey kaydırma ve form alanları sayfa değiştirmez.
  let start = null;
  const basla = (x, y, target) => {
    start = target.closest('input, textarea, select, .dd-menu') ? null : { x, y };
  };
  const bitir = (x, y) => {
    if (!start || pages.length < 2) { start = null; return; }
    const dx = x - start.x;
    const dy = y - start.y;
    start = null;
    if (Math.abs(dx) >= ESIK && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const yon = dx < 0 ? 1 : -1;
      show(index + yon, 'kaydırma', yon);
    }
  };
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { start = null; return; }
    basla(e.touches[0].clientX, e.touches[0].clientY, e.target);
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (t) bitir(t.clientX, t.clientY);
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') basla(e.clientX, e.clientY, e.target);
  }, { passive: true });
  stage.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') bitir(e.clientX, e.clientY);
  }, { passive: true });

  return {
    show,
    home() { show(0, 'sıfırlama'); },
    start() { running = true; schedule(); },
    stop() { running = false; schedule(); },
  };
}
