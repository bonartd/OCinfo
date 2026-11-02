// Sayfa 3 — Ödünç Cihaz Sistemi kullanım bilgileri: üç görsel özet kartı + açılır menüden
// seçilen büyük grafik. Veri: data/istatistik.json (tools/veri/istatistik_olustur.py ile Excel'den
// üretilir; yalnızca anonim rezervasyon sayımları, eğitim yılı bazında). Birden çok yıl varsa yıl
// seçimi görünür. Grafikler kütüphanesiz, satır içi SVG'dir (AGENTS.md 3.5).

import { log } from '../log.js';

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const SINIFLAR = [
  { id: '1', etiket: '1. sınıf' },
  { id: '2', etiket: '2. sınıf' },
  { id: '3', etiket: '3. sınıf' },
  { id: '4', etiket: '4. sınıf' },
];

// Kayıt sütunları: [bölüm, sınıf ("" = bilinmiyor), "YYYY-AA", rezervasyon sayısı]
const C = { bolum: 0, sinif: 1, ay: 2, n: 3 };

const VIEWS = [
  { id: 'bolum', etiket: 'Bölümlere göre' },
  { id: 'sinif', etiket: 'Sınıflara göre' },
  { id: 'ay', etiket: 'Aylara göre' },
  { id: 'yillar', etiket: 'Yıllara göre' },
];
const DEFAULT_VIEW = 'bolum';

const SVG_NS = 'http://www.w3.org/2000/svg';
const num = new Intl.NumberFormat('tr-TR');
const pct = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function ayParca(key) {
  const [y, m] = key.split('-').map(Number);
  return { ay: AYLAR[m - 1], kisa: AY_KISA[m - 1], yil: y };
}

function ayAdi(key, kisa) {
  const p = ayParca(key);
  return kisa ? `${p.kisa} ${String(p.yil).slice(2)}` : `${p.ay} ${p.yil}`;
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
const BELIRSIZ = 'Belirtilmemiş';
const DIGER = 'Diğer';
// Bölüm sıralaması: gerçek bölümler (çoktan aza), en sonda Diğer.
const sonaKalan = (label) => (label === DIGER ? 1 : 0);
// "2015-2016" → "15-16"
const kisaYil = (y) => `${y.slice(2, 4)}-${y.slice(7, 9)}`;

// ---- Seçili yıl ve görünüm için grafik kalemleri ----
function aggregate(data, state) {
  if (state.view === 'yillar') {
    return Object.keys(data.yillar).map((y) => ({
      label: `${y} eğitim yılı`,
      short: y, tiny: kisaYil(y), value: total(data.yillar[y].kayit),
    }));
  }
  const yil = data.yillar[state.yil];
  const rows = yil.kayit;
  if (state.view === 'bolum') {
    // "Belirtilmemiş" çubuk olarak çizilmez (ölçeği bozar); sayısı not satırında verilir.
    return Array.from(sumBy(rows, C.bolum), ([label, value]) => ({ label, value }))
      .filter((d) => d.label !== BELIRSIZ)
      .sort((a, b) => sonaKalan(a.label) - sonaKalan(b.label) || b.value - a.value);
  }
  if (state.view === 'sinif') {
    const m = sumBy(rows, C.sinif);
    return SINIFLAR.map((s) => ({ label: s.etiket, value: m.get(s.id) || 0 }));
  }
  const m = sumBy(rows, C.ay);
  return yil.aylar.map((a) => ({ label: ayAdi(a), short: ayAdi(a, true), value: m.get(a) || 0 }));
}

// ---- Özet kartları (iri sayı + küçük grafik) ----
function svgEl(name, attrs, text) {
  const el = document.createElementNS(SVG_NS, name);
  Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
  if (text !== undefined) el.textContent = text;
  return el;
}

// En yoğun ay kartı: 12 aylık mini çubuk şeridi, en yoğun ay koyu.
function monthStrip(svg, yil, aylarMap, enAy) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const W = 120;
  const H = 44;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const max = Math.max(1, ...yil.aylar.map((a) => aylarMap.get(a) || 0));
  const bw = W / yil.aylar.length;
  yil.aylar.forEach((a, i) => {
    const v = aylarMap.get(a) || 0;
    const h = v ? Math.max(3, (H - 4) * (v / max)) : 2;
    svg.appendChild(svgEl('rect', {
      x: i * bw + 1, y: H - h, width: bw - 2, height: h, rx: 1.5,
      class: a === enAy ? 'mini mini--max' : 'mini',
    }));
  });
}

// En çok kullanan bölüm kartı: toplam içindeki payı gösteren halka.
function shareRing(svg, oran) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const r = 26;
  const cev = 2 * Math.PI * r;
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.appendChild(svgEl('circle', { cx: 32, cy: 32, r, class: 'ring-bg' }));
  svg.appendChild(svgEl('circle', {
    cx: 32, cy: 32, r, class: 'ring-fg',
    'stroke-dasharray': `${(cev * oran).toFixed(1)} ${cev.toFixed(1)}`, transform: 'rotate(-90 32 32)',
  }));
}

// ---- SVG çubuk grafik (tek seri: tek renk, lejant yok, değerler çubukta) ----
// Yalnızca veri ucu yuvarlatılmış çubuk (taban düz).
function barPath(x, y, w, h, horizontal) {
  const r = Math.min(6, (horizontal ? h : w) / 2, horizontal ? w : h);
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
  const vurgu = Math.max(...items.filter((d) => !d.muted).map((d) => d.value));
  const maxIdx = items.findIndex((d) => !d.muted && d.value === vurgu);
  const sel = opts.selected;
  const horizontal = opts.horizontal;
  const g = svg.appendChild(svgEl('g', { class: horizontal ? 'chart chart--h' : 'chart chart--v' }));
  const bottom = 44;

  if (!horizontal) {
    g.appendChild(svgEl('line', { x1: 0, x2: W, y1: H - bottom + 0.5, y2: H - bottom + 0.5, class: 'base' }));
  }

  items.forEach((d, i) => {
    let x; let y; let w; let h; let hit;
    const cls = ['bar'];
    if (i === maxIdx) cls.push('bar--max');
    if (d.muted) cls.push('bar--muted');
    if (sel !== null && sel !== i) cls.push('bar--dim');

    if (horizontal) {
      // Ad çubuğun üstünde; çubuk tüm genişliği kullanır, değer çubuğun ucunda.
      const labelH = 26;
      const valueW = 64;
      const band = H / items.length;
      h = Math.min(46, (band - labelH) * 0.82);
      x = 0;
      w = Math.max(4, ((W - valueW) * d.value) / max);
      y = i * band + labelH + (band - labelH - h) / 2;
      hit = svgEl('rect', { x: 0, y: i * band, width: W, height: band, class: 'hit' });
      g.appendChild(svgEl('text', { x: 0, y: y - 8, class: 'lbl lbl--h' }, d.label));
      g.appendChild(svgEl('path', { d: barPath(x, y, w, h, true), class: cls.join(' '), style: `--i:${i}`, 'data-i': i }));
      g.appendChild(svgEl('text', { x: x + w + 10, y: y + h / 2, class: 'val', 'dominant-baseline': 'central' }, num.format(d.value)));
    } else {
      const top = 40;
      const plotH = H - top - bottom;
      const band = W / items.length;
      w = Math.min(150, band * 0.84);
      h = d.value ? Math.max(3, (plotH * d.value) / max) : 0;
      x = i * band + (band - w) / 2;
      y = top + plotH - h;
      hit = svgEl('rect', { x: i * band, y: 0, width: band, height: H, class: 'hit' });
      if (h) g.appendChild(svgEl('path', { d: barPath(x, y, w, h, false), class: cls.join(' '), style: `--i:${i}`, 'data-i': i }));
      // Çok sütunlu grafikte (ör. 11 yıl) değer yazısı daralır.
      g.appendChild(svgEl('text', { x: x + w / 2, y: y - 10, class: band < 60 ? 'val val--sm' : 'val', 'text-anchor': 'middle' }, num.format(d.value)));
      // Dar sütunlarda yalnızca ilk kelime ("Eyl 25" → "Eyl").
      const label = d.short || d.label;
      let metin = label;
      if (d.tiny) metin = band < 100 ? d.tiny : label;
      else if (band < 80) metin = label.split(' ')[0];
      g.appendChild(svgEl('text', { x: x + w / 2, y: H - bottom + 28, class: 'lbl', 'text-anchor': 'middle' }, metin));
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
        <h2 class="section-title st-title anim" style="--i:0">Kullanım Bilgileri</h2>

        <div class="st-kpis">
          <div class="kpi card anim" style="--i:1">
            <span class="kpi-val" data-k="rez"></span>
            <span class="kpi-lbl">rezervasyon <span data-k="yil"></span></span>
          </div>
          <div class="kpi card anim" style="--i:2">
            <span class="kpi-lbl">En yoğun ay</span>
            <span class="kpi-val kpi-val--word" data-k="enAy"></span>
            <svg class="kpi-strip" aria-hidden="true"></svg>
          </div>
          <div class="kpi kpi--ring card anim" style="--i:3">
            <div class="kpi-ring">
              <svg aria-hidden="true"></svg>
              <span data-k="pay"></span>
            </div>
            <div>
              <span class="kpi-lbl">En çok kullanan</span>
              <span class="kpi-name" data-k="enBolum"></span>
            </div>
          </div>
        </div>

        <section class="st-chart card anim" style="--i:4">
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
              <div class="dd dd--yil">
                <button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false">
                  <span class="dd-label"></span>
                  <svg class="dd-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-7 9z"/></svg>
                </button>
                <ul class="dd-menu dd-menu--yil" role="listbox" hidden>
                  ${years.slice().reverse().map((y) => `<li><button type="button" role="option" data-v="${esc(y)}" aria-selected="false">${esc(y)}</button></li>`).join('')}
                </ul>
              </div>` : ''}
            <p class="st-detail" aria-live="polite"></p>
          </div>
          <svg class="st-svg" role="img"></svg>
        </section>

        <p class="source st-source anim" style="--i:5">Kaynak: Ödünç Cihaz Ofisi rezervasyon kayıtları.</p>
      </div>`;

    const svg = el.querySelector('.st-svg');
    const detail = el.querySelector('.st-detail');
    const ddBtn = el.querySelector('.dd:not(.dd--yil) .dd-btn');
    const ddLabel = el.querySelector('.dd:not(.dd--yil) .dd-label');
    const ddMenu = el.querySelector('.dd:not(.dd--yil) .dd-menu');
    const yilDd = el.querySelector('.dd--yil');
    const yilBtn = yilDd && yilDd.querySelector('.dd-btn');
    const yilMenu = yilDd && yilDd.querySelector('.dd-menu');
    const strip = el.querySelector('.kpi-strip');
    const ring = el.querySelector('.kpi-ring svg');
    const k = (key) => el.querySelector(`[data-k="${key}"]`);
    let state = Object.assign({}, DEFAULT);
    let selected = null;
    let items = [];

    function openMenu(open) {
      ddMenu.hidden = !open;
      ddBtn.setAttribute('aria-expanded', String(open));
    }
    function openYil(open) {
      if (!yilMenu) return;
      yilMenu.hidden = !open;
      yilBtn.setAttribute('aria-expanded', String(open));
    }

    // Ayrıntı yalnızca bir çubuğa dokununca görünür (az metin).
    function detailText() {
      if (selected === null || !items[selected]) return '';
      const sum = items.reduce((t, d) => t + d.value, 0) || 1;
      const d = items[selected];
      return `<strong>${esc(d.label)}</strong> · ${num.format(d.value)} · %${pct.format((d.value / sum) * 100)}`;
    }

    function updateKpis() {
      const yil = data.yillar[state.yil];
      const rows = yil.kayit;
      const toplam = total(rows);
      const aylar = sumBy(rows, C.ay);
      const ay = maxEntry(aylar);
      // "Diğer" ve "Belirtilmemiş" bölüm sayılmaz.
      const bolum = maxEntry(sumBy(rows, C.bolum), (b) => b === DIGER || b === BELIRSIZ);
      k('rez').textContent = num.format(toplam);
      k('yil').textContent = `· ${state.yil}`;
      k('enAy').textContent = ay ? ayParca(ay[0]).ay : '—';
      monthStrip(strip, yil, aylar, ay && ay[0]);
      k('enBolum').textContent = bolum ? bolum[0] : '—';
      const oran = bolum && toplam ? bolum[1] / toplam : 0;
      k('pay').textContent = `%${pct.format(oran * 100)}`;
      shareRing(ring, oran);
    }

    function applySelection() {
      svg.querySelectorAll('.bar').forEach((b) => {
        b.classList.toggle('bar--dim', selected !== null && Number(b.getAttribute('data-i')) !== selected);
      });
      detail.innerHTML = detailText();
    }

    function update() {
      items = aggregate(data, state);
      const view = VIEWS.find((v) => v.id === state.view);
      ddLabel.textContent = view.etiket;
      ddMenu.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.v === state.view)));
      if (yilDd) {
        yilDd.hidden = state.view === 'yillar';
        yilDd.querySelector('.dd-label').textContent = state.yil;
        yilMenu.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.v === state.yil)));
      }
      updateKpis();
      svg.setAttribute('aria-label', `${view.etiket} rezervasyon grafiği`);
      drawChart(svg, items, { horizontal: state.view === 'bolum', selected });
      detail.innerHTML = detailText();
    }

    ddBtn.addEventListener('click', () => { openYil(false); openMenu(ddMenu.hidden); });
    ddMenu.addEventListener('click', (e) => {
      const opt = e.target.closest('button[data-v]');
      if (!opt) return;
      state.view = opt.dataset.v;
      selected = null;
      openMenu(false);
      log('Grafik seçildi', { ayrinti: VIEWS.find((v) => v.id === state.view).etiket });
      update();
    });
    // Menü dışına dokununca kapanır.
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.dd')) { openMenu(false); openYil(false); }
    });

    if (yilDd) {
      yilBtn.addEventListener('click', () => { openMenu(false); openYil(yilMenu.hidden); });
      yilMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-v]');
        if (!btn) return;
        state.yil = btn.dataset.v;
        selected = null;
        openYil(false);
        log('Yıl seçildi', { ayrinti: state.yil });
        update();
      });
    }

    svg.addEventListener('click', (e) => {
      const hit = e.target.closest('.hit');
      if (!hit) return;
      const i = Number(hit.getAttribute('data-i'));
      selected = selected === i ? null : i;
      if (selected !== null) log('Çubuk seçildi', { ayrinti: items[i].label });
      applySelection();
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
      openYil(false);
      update();
    };
    update();
  },

  // Hareketsizlikte varsayılan grafiğe (son yıl, bölümlere göre) dön.
  reset() {
    resetState();
  },
};
