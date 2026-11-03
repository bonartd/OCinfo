// Sayfa 3 — Sisteme yeni eklenen ekipmanlar: görselli kartlar; karta dokununca kart döner,
// arka yüzde temel özellikler görünür. Liste data/ekipmanlar.json'dadır; görseller
// assets/img/ekipman/ altında (520 px JPEG).

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const IMG = 'assets/img/ekipman/';
// Ön yüzde "çevir" ipucu simgesi
const DONDUR = '<svg class="eq-flip-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0113.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 01-13.7 5.6L4 15M4 20v-5h5"/></svg>';
let hepsiniKapat = () => {};

export default {
  id: 'ekipman',
  title: 'Yeni ekipmanlar',

  async render(el) {
    const res = await fetch('data/ekipmanlar.json');
    if (!res.ok) throw new Error('ekipmanlar.json yüklenemedi: ' + res.status);
    const data = await res.json();
    const list = data.ekipmanlar;
    const adet = list.reduce((t, e) => t + e.adet, 0);

    const cards = list.map((e, i) => `
      <li class="eq-item anim" style="--i:${i + 1}">
        <button type="button" class="eq-card" aria-pressed="false"
                aria-label="${esc(e.model)}, ${esc(e.cihaz)}, ${e.adet} adet — özellikleri göster">
          <span class="eq-inner">
            <span class="eq-face eq-front card">
              <span class="eq-img"><img src="${IMG}${esc(e.gorsel)}" alt="" width="${e.en}" height="${e.boy}" draggable="false"></span>
              <span class="eq-text">
                <b class="eq-name">${esc(e.model)}</b>
                <span class="eq-model">${esc(e.cihaz)}</span>
              </span>
              <span class="eq-count">${e.adet} adet</span>
              ${DONDUR}
            </span>
            <span class="eq-face eq-back card" aria-hidden="true">
              <b class="eq-back-model">${esc(e.cihaz)}</b>
              <ul class="eq-specs">${(e.ozellik || []).map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
            </span>
          </span>
        </button>
      </li>`).join('');

    el.innerHTML = `
      <div class="eq">
        <header class="eq-head anim" style="--i:0">
          <h2 class="section-title eq-title">Sisteme yeni eklenen ekipmanlar</h2>
          <p class="eq-sum"><b>${list.length}</b> çeşit · <b>${adet}</b> adet</p>
        </header>
        <ul class="eq-grid">${cards}</ul>
      </div>`;

    const buttons = Array.from(el.querySelectorAll('.eq-card'));
    const cevir = (btn, acik) => {
      btn.classList.toggle('is-flipped', acik);
      btn.setAttribute('aria-pressed', String(acik));
      btn.querySelector('.eq-back').setAttribute('aria-hidden', String(!acik));
    };
    hepsiniKapat = () => buttons.forEach((b) => cevir(b, false));

    // Aynı anda tek kart açık: dokunulan döner, diğerleri ön yüze döner.
    el.querySelector('.eq-grid').addEventListener('click', (ev) => {
      const btn = ev.target.closest('.eq-card');
      if (!btn) return;
      const acik = !btn.classList.contains('is-flipped');
      buttons.forEach((b) => { if (b !== btn) cevir(b, false); });
      cevir(btn, acik);
    });
  },

  // Hareketsizlikte / sayfa sıfırlanınca kartlar ön yüze döner.
  reset() {
    hepsiniKapat();
  },
};
