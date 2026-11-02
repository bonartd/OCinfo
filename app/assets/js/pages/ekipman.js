// Sayfa 4 — Sisteme yeni eklenen ekipmanlar: görselli kartlar; karta dokununca görsel büyür.
// Liste data/ekipmanlar.json'dadır; görseller assets/img/ekipman/ altında (520 px JPEG).

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const IMG = 'assets/img/ekipman/';
let kapat = () => {};

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
        <button type="button" class="eq-card card" data-i="${i}" aria-label="${esc(e.cihaz)}, ${esc(e.model)}, ${e.adet} adet — görseli büyüt">
          <span class="eq-img"><img src="${IMG}${esc(e.gorsel)}" alt="" width="${e.en}" height="${e.boy}" draggable="false"></span>
          <span class="eq-text">
            <b class="eq-name">${esc(e.cihaz)}</b>
            <span class="eq-model">${esc(e.model)}</span>
          </span>
          <span class="eq-count">${e.adet} adet</span>
        </button>
      </li>`).join('');

    el.innerHTML = `
      <div class="eq">
        <header class="eq-head anim" style="--i:0">
          <h2 class="section-title eq-title">Sisteme yeni eklenen ekipmanlar</h2>
          <p class="eq-sum"><b>${list.length}</b> çeşit · <b>${adet}</b> adet</p>
        </header>
        <ul class="eq-grid">${cards}</ul>
        <p class="source eq-source anim" style="--i:${list.length + 1}">Görseller temsilidir.</p>
        <div class="eq-zoom" hidden role="dialog" aria-modal="true" aria-label="Ekipman görseli">
          <figure class="eq-zoom-box card">
            <img class="eq-zoom-img" alt="" draggable="false">
            <figcaption>
              <b class="eq-zoom-name"></b>
              <span class="eq-zoom-model"></span>
              <span class="eq-count eq-zoom-count"></span>
            </figcaption>
          </figure>
          <p class="eq-zoom-hint">Kapatmak için dokun</p>
        </div>
      </div>`;

    const zoom = el.querySelector('.eq-zoom');
    const zImg = zoom.querySelector('.eq-zoom-img');

    kapat = () => { zoom.hidden = true; };

    el.querySelector('.eq-grid').addEventListener('click', (ev) => {
      const btn = ev.target.closest('.eq-card');
      if (!btn) return;
      const e = list[Number(btn.dataset.i)];
      zImg.src = IMG + e.gorsel;
      zImg.alt = `${e.cihaz} — ${e.model}`;
      zoom.querySelector('.eq-zoom-name').textContent = e.cihaz;
      zoom.querySelector('.eq-zoom-model').textContent = e.model;
      zoom.querySelector('.eq-zoom-count').textContent = `${e.adet} adet`;
      zoom.hidden = false;
    });
    zoom.addEventListener('click', () => kapat());
  },

  // Hareketsizlikte / sayfa sıfırlanınca büyütülmüş görsel kapanır.
  reset() {
    kapat();
  },
};
