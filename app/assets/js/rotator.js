// Sayfa döndürücü: sayfaları sırayla gösterir. Otomatik geçiş yalnızca kiosk boştayken
// çalışır; kullanıcı dokunurken durur. Geçiş yalnızca opacity/transform ile yapılır.

export function createRotator({ pages, stage, dots, defaultSec }) {
  let index = 0;
  let timer = null;
  let running = false;

  pages.forEach((page, i) => {
    page.el.classList.toggle('is-active', i === 0);
    page.el.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  });

  // Tek sayfa varken nokta göstergesi gereksiz.
  dots.hidden = pages.length < 2;
  dots.innerHTML = '';
  const dotButtons = pages.map((page, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('aria-label', page.title);
    b.addEventListener('click', () => show(i));
    dots.appendChild(b);
    return b;
  });
  updateDots();

  function updateDots() {
    dotButtons.forEach((b, i) => b.classList.toggle('is-active', i === index));
  }

  function show(i) {
    const next = (i + pages.length) % pages.length;
    if (next !== index) {
      pages[index].el.classList.remove('is-active');
      pages[index].el.setAttribute('aria-hidden', 'true');
      pages[next].el.classList.add('is-active');
      pages[next].el.setAttribute('aria-hidden', 'false');
      pages[next].el.scrollTop = 0;
      index = next;
      updateDots();
    }
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;
    if (!running || pages.length < 2) return;
    const sec = pages[index].durationSec || defaultSec;
    timer = setTimeout(() => show(index + 1), sec * 1000);
  }

  // Basit yatay kaydırma (swipe) ile sayfa değiştirme.
  let startX = null;
  stage.addEventListener('pointerdown', (e) => {
    // Form alanlarında metin seçerken sayfa değişmesin.
    startX = e.target.closest('input, textarea') ? null : e.clientX;
  }, { passive: true });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null || pages.length < 2) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 80) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
  stage.addEventListener('pointercancel', () => { startX = null; }, { passive: true });

  return {
    show,
    home() { show(0); },
    start() { running = true; schedule(); },
    stop() { running = false; schedule(); },
  };
}
