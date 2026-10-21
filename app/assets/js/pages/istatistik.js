// Sayfa 3 — Ödünç Cihaz Sistemi kullanım bilgileri: açılır menüden seçilen etkileşimli grafikler.
// Veri: data/istatistik.json (tools/veri/istatistik_olustur.py ile Excel'den üretilir; yalnızca
// anonim rezervasyon sayımları, eğitim yılı bazında). Birden çok yıl varsa yıl seçimi görünür.
// Grafikler kütüphanesiz, satır içi SVG'dir (AGENTS.md 3.5).

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const SINIFLAR = [
  { id: '1', etiket: '1. sınıf' },
  { id: '2', etiket: '2. sınıf' },
  { id: '3', etiket: '3. sınıf' },
  { id: '4', etiket: '4. sınıf' },
];

// Kayıt sütunları: [bölüm, sınıf, ay, teslim günü, iade günü, teslim saati, iade saati, sayı]
const C = { bolum: 0, sinif: 1, ay: 2, n: 7 };

const VIEWS = [
  { id: 'bolum', etiket: 'Bölümlere göre' },
  { id: 'sinif', etiket: 'Sınıflara göre' },
  { id: 'ay', etiket: 'Aylara göre' },
  { id: 'yillar', etiket: 'Yıllara göre' },
];
const DEFAULT_VIEW = 'bolum';

const SVG_NS = 'http://www.w3.org/2000/svg';
const num = new Intl.NumberFormat('tr-TR');
const pct = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function ayAdi(key, kisa) {
  const [y, m] = key.split('-').map(Number);
  return kisa ? `${AY_KISA[m - 1]} ${String(y).slice(2)}` : `${AYLAR[m - 1]} ${y}`;
}

function sumBy(rows, col) {
  const m = new Map();
  rows.forEach((r) => m.set(r[col], (m.get(r[col]) || 0) + r[C.n]));
  return m;
}

function maxEntry(m, skip) {
  let best = null;
  m.forEach((v, k) => { if (!(skip && skip(k)) && (!best || v > best[1])) best = [k, v]; });
  return best;
}

const total = (rows) => rows.reduce((t, r) => t + r[C.n], 0);

// ---- Seçili yıl ve görünüm için grafik kalemleri ----
function aggregate(data, state) {
  if (state.view === 'yillar') {
    return Object.keys(data.yillar).map((y) => ({ label: `${y} eğitim yılı`, short: y, value: total(data.yillar[y].kayit) }));
  }
  const yil = data.yillar[state.yil];
  const rows = yil.kayit;
  if (state.view === 'bolum') {
    return Array.from(sumBy(rows, C.bolum), ([label, value]) => ({ label, value }))
      .sort((a, b) => (a.label === 'Diğer') - (b.label === 'Diğer') || b.value - a.value);
  }
  if (state.view === 'sinif') {
    const m = sumBy(rows, C.sinif);
    return SINIFLAR.map((s) => ({ label: s.etiket, value: m.get(s.id) || 0 }));
  }
  const m = sumBy(rows, C.ay);
  return yil.aylar.map((a) => ({ label: ayAdi(a), short: ayAdi(a, true), value: m.get(a) || 0 }));
}

function kpis(data, state) {
  const rows = data.yillar[state.yil].kayit;
  const ay = maxEntry(sumBy(rows, C.ay));
  const bolum = maxEntry(sumBy(rows, C.bolum), (k) => k === 'Diğer');
  return {
    rez: num.format(total(rows)),
    enAy: ay ? ayAdi(ay[0]) : '—',
    enBolum: bolum ? bolum[0] : '—',
  };
}

// ---- SVG çubuk grafik (tek seri: tek renk, lejant yok, değerler çubukta) ----
function svgEl(name, attrs, text) {
  const el = document.createElementNS(SVG_NS, name);
  Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
  if (text !== undefined) el.textContent = text;
  return el;
}

// Yalnızca veri ucu yuvarlatılmış çubuk (taban düz).
function barPath(x, y, w, h, horizontal) {
  const r = Math.min(4, (horizontal ? h : w) / 2, horizontal ? w : h);
  if (horizontal) {
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function drawChart(svg, items, opts) {
  const W = Math.max(280, svg.clientWidth || svg.parentNode.clientWidth);
  const H = Math.max(200, svg.clientHeight || svg.parentNode.clientHeight);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (!items.length) return;

  const max = Math.max(1, ...items.map((d) => d.value));
  const maxIdx = items.findIndex((d) => d.value === max);
  const sel = opts.selected;
  const horizontal = opts.horizontal;
  const g = svg.appendChild(svgEl('g', {}));
  const bottom = 40;

  if (!horizontal) {
    g.appendChild(svgEl('line', { x1: 0, x2: W, y1: H - bottom + 0.5, y2: H - bottom + 0.5, class: 'base' }));
  }

  items.forEach((d, i) => {
    let x; let y; let w; let h; let hit;
    const cls = ['bar'];
    if (i === maxIdx) cls.push('bar--max');
    if (sel !== null && sel !== i) cls.push('bar--dim');

    if (horizontal) {
      // Dar ekranda (telefon) etiket çubuğun üstüne yazılır; geniş ekranda solda.
      const stacked = W < 520;
      const labelW = stacked ? 0 : Math.min(300, W * 0.36);
      const labelH = stacked ? 22 : 0;
      const valueW = 56;
      const band = H / items.length;
      h = Math.min(48, (band - labelH) * 0.74);
      x = labelW;
      w = Math.max(2, ((W - labelW - valueW) * d.value) / max);
      y = i * band + labelH + (band - labelH - h) / 2;
      hit = svgEl('rect', { x: 0, y: i * band, width: W, height: band, class: 'hit' });
      if (stacked) {
        g.appendChild(svgEl('text', { x: 0, y: y - 6, class: 'lbl' }, d.label));
      } else {
        g.appendChild(svgEl('text', { x: labelW - 12, y: y + h / 2, class: 'lbl', 'text-anchor': 'end', 'dominant-baseline': 'central' }, d.label));
      }
      g.appendChild(svgEl('path', { d: barPath(x, y, w, h, true), class: cls.join(' ') }));
      g.appendChild(svgEl('text', { x: x + w + 8, y: y + h / 2, class: 'val', 'dominant-baseline': 'central' }, num.format(d.value)));
    } else {
      const top = 30;
      const plotH = H - top - bottom;
      const band = W / items.length;
      w = Math.min(110, band * 0.8);
      h = d.value ? Math.max(2, (plotH * d.value) / max) : 0;
      x = i * band + (band - w) / 2;
      y = top + plotH - h;
      hit = svgEl('rect', { x: i * band, y: 0, width: band, height: H, class: 'hit' });
      if (h) g.appendChild(svgEl('path', { d: barPath(x, y, w, h, false), class: cls.join(' ') }));
      g.appendChild(svgEl('text', { x: x + w / 2, y: y - 8, class: 'val', 'text-anchor': 'middle' }, num.format(d.value)));
      // Dar sütunlarda yalnızca ilk kelime ("Eyl 25" → "Eyl").
      const label = d.short || d.label;
      g.appendChild(svgEl('text', { x: x + w / 2, y: H - bottom + 24, class: 'lbl', 'text-anchor': 'middle' },
        band < 50 ? label.split(' ')[0] : label));
    }
    hit.setAttribute('data-i', i);
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', `${d.label}: ${num.format(d.value)} rezervasyon`);
    g.appendChild(hit);
  });
}

// ---- Sayfa ----
let resetState = () => {};

export default {
  id: 'istatistik',
  title: 'Kullanım bilgileri',
  durationSec: 40,

  async render(el) {
    const res = await fetch('data/istatistik.json');
    if (!res.ok) throw new Error('istatistik.json yüklenemedi: ' + res.status);
    const data = await res.json();
    const years = Object.keys(data.yillar);
    if (!years.length) throw new Error('istatistik.json içinde yıl yok');
    const DEFAULT = { view: DEFAULT_VIEW, yil: years[years.length - 1] };

    el.innerHTML = `
      <div class="st">
        <header class="st-head">
          <h2 class="section-title">Ödünç Cihaz Sistemi Kullanım Bilgileri</h2>
          <dl class="st-kpis">
            <div><dt>Rezervasyon sayısı <span data-k="yil"></span></dt><dd data-k="rez"></dd></div>
            <div><dt>En yoğun ay</dt><dd data-k="enAy"></dd></div>
            <div><dt>En çok kullanan bölüm</dt><dd data-k="enBolum"></dd></div>
          </dl>
        </header>

        <section class="st-chart card">
          <div class="st-chart-head">
            <div class="dd">
              <button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="dd-label"></span>
                <svg class="dd-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-7 9z"/></svg>
              </button>
              <ul class="dd-menu" role="listbox" hidden>
                ${VIEWS.map((v) => `<li><button type="button" role="option" data-v="${v.id}" aria-selected="false">${esc(v.etiket)}</button></li>`).join('')}
              </ul>
            </div>
            ${years.length > 1 ? `
              <div class="seg" role="group" data-name="yil">
                ${years.map((y) => `<button type="button" data-v="${esc(y)}" aria-pressed="false">${esc(y)}</button>`).join('')}
              </div>` : ''}
          </div>
          <p class="st-detail" aria-live="polite"></p>
          <svg class="st-svg" role="img"></svg>
        </section>

        <p class="source">Kaynak: Ödünç Cihaz Ofisi rezervasyon kayıtları.</p>
      </div>`;

    const svg = el.querySelector('.st-svg');
    const detail = el.querySelector('.st-detail');
    const ddBtn = el.querySelector('.dd-btn');
    const ddLabel = el.querySelector('.dd-label');
    const ddMenu = el.querySelector('.dd-menu');
    const yilSeg = el.querySelector('.seg[data-name="yil"]');
    let state = Object.assign({}, DEFAULT);
    let selected = null;
    let items = [];

    function openMenu(open) {
      ddMenu.hidden = !open;
      ddBtn.setAttribute('aria-expanded', String(open));
    }

    function detailText() {
      if (!items.length) return 'Bu yıl için veri yok.';
      if (selected === null) {
        const max = items.reduce((a, d) => (d.value > a.value ? d : a), items[0]);
        return `En yüksek: <strong>${esc(max.label)}</strong> · ${num.format(max.value)} rezervasyon`;
      }
      const sum = items.reduce((t, d) => t + d.value, 0) || 1;
      const d = items[selected];
      return `<strong>${esc(d.label)}</strong> · ${num.format(d.value)} rezervasyon · toplam içindeki payı %${pct.format((d.value / sum) * 100)}`;
    }

    function update() {
      items = aggregate(data, state);
      const view = VIEWS.find((v) => v.id === state.view);
      ddLabel.textContent = view.etiket;
      ddMenu.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.v === state.view)));
      if (yilSeg) {
        yilSeg.hidden = state.view === 'yillar';
        yilSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.yil)));
      }
      const k = kpis(data, state);
      Object.keys(k).forEach((key) => { el.querySelector(`[data-k="${key}"]`).textContent = k[key]; });
      el.querySelector('[data-k="yil"]').textContent = years.length > 1 ? `· ${state.yil}` : '';
      svg.setAttribute('aria-label', `${view.etiket} rezervasyon grafiği`);
      drawChart(svg, items, { horizontal: state.view === 'bolum', selected });
      detail.innerHTML = detailText();
    }

    ddBtn.addEventListener('click', () => openMenu(ddMenu.hidden));
    ddMenu.addEventListener('click', (e) => {
      const opt = e.target.closest('button[data-v]');
      if (!opt) return;
      state.view = opt.dataset.v;
      selected = null;
      openMenu(false);
      update();
    });
    // Menü dışına dokununca kapanır.
    el.addEventListener('click', (e) => {
      if (!ddMenu.hidden && !e.target.closest('.dd')) openMenu(false);
    });

    if (yilSeg) {
      yilSeg.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-v]');
        if (!btn) return;
        state.yil = btn.dataset.v;
        selected = null;
        update();
      });
    }

    svg.addEventListener('click', (e) => {
      const hit = e.target.closest('.hit');
      if (!hit) return;
      const i = Number(hit.getAttribute('data-i'));
      selected = selected === i ? null : i;
      update();
    });

    // Yönlendirme değişince yeniden çiz (tek gözlemci, sayfa ömrü boyunca).
    let raf = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }).observe(svg);

    resetState = () => {
      state = Object.assign({}, DEFAULT);
      selected = null;
      openMenu(false);
      update();
    };
    update();
  },

  // Hareketsizlikte varsayılan grafiğe (son yıl, bölümlere göre) dön.
  reset() {
    resetState();
  },
};
