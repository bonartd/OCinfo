// Sayfa 3 — Ödünç Cihaz Sistemi kullanım bilgileri: kullanıcının seçtiği etkileşimli grafikler.
// Veri: data/istatistik.json (tools/veri/istatistik_olustur.py ile Excel'den üretilir; yalnızca
// anonim rezervasyon sayımları, eğitim yılı bazında). Birden çok yıl varsa yıl seçimi ve
// "Yıllar" grafiği; veride saat varsa teslim alma / iade saati grafikleri kendiliğinden açılır.
// Grafikler kütüphanesiz, satır içi SVG'dir (AGENTS.md 3.5).

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const GUN_KISA = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const SINIFLAR = [
  { id: '1', etiket: '1. sınıf' },
  { id: '2', etiket: '2. sınıf' },
  { id: '3', etiket: '3. sınıf' },
  { id: '4', etiket: '4. sınıf' },
];
// Isı haritasında gösterilen günler (hafta sonu gösterilmez) ve yoğunluk düzeyleri.
const IS_GUNLERI = [0, 1, 2, 3, 4];
const DUZEYLER = ['Çok sakin', 'Sakin', 'Orta', 'Yoğun', 'Çok yoğun'];

// Kayıt sütunları: [bölüm, sınıf, ay, teslim günü, iade günü, teslim saati, iade saati, sayı]
const C = { bolum: 0, sinif: 1, ay: 2, tg: 3, ig: 4, ts: 5, is: 6, n: 7 };

const VIEWS = [
  { id: 'bolum', etiket: 'Bölüm' },
  { id: 'sinif', etiket: 'Sınıf' },
  { id: 'ay', etiket: 'Aylar' },
  { id: 'teslimGun', etiket: 'Teslim alma günü', isi: true, not: 'Teslim alma günü, rezervasyonun başlangıç tarihine göredir.' },
  { id: 'iadeGun', etiket: 'İade günü', isi: true },
  { id: 'teslimSaat', etiket: 'Teslim alma saati', saat: true },
  { id: 'iadeSaat', etiket: 'İade saati', saat: true },
  { id: 'yillar', etiket: 'Yıllar', cokYil: true },
];

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
  rows.forEach((r) => {
    if (r[col] !== null && r[col] !== undefined) m.set(r[col], (m.get(r[col]) || 0) + r[C.n]);
  });
  return m;
}

function maxEntry(m, skip) {
  let best = null;
  m.forEach((v, k) => { if (!(skip && skip(k)) && (!best || v > best[1])) best = [k, v]; });
  return best;
}

function hourItems(m) {
  const hours = Array.from(m.keys());
  if (!hours.length) return [];
  const items = [];
  for (let h = Math.min(...hours); h <= Math.max(...hours); h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    items.push({ label: `${label}–${String(h + 1).padStart(2, '0')}:00`, short: label, value: m.get(h) || 0 });
  }
  return items;
}

// ---- Seçili yıl ve görünüm için grafik kalemleri ----
function aggregate(data, state) {
  if (state.view === 'yillar') {
    return Object.keys(data.yillar).map((y) => ({
      label: `${y} eğitim yılı`, short: y, value: data.yillar[y].kayit.reduce((t, r) => t + r[C.n], 0),
    }));
  }
  const yil = data.yillar[state.yil];
  const rows = yil.kayit;
  switch (state.view) {
    case 'bolum': {
      return Array.from(sumBy(rows, C.bolum), ([label, value]) => ({ label, value }))
        .sort((a, b) => (a.label === 'Diğer') - (b.label === 'Diğer') || b.value - a.value);
    }
    case 'sinif': {
      const m = sumBy(rows, C.sinif);
      return SINIFLAR.map((s) => ({ label: s.etiket, value: m.get(s.id) || 0 }));
    }
    case 'ay': {
      const m = sumBy(rows, C.ay);
      return yil.aylar.map((a) => ({ label: ayAdi(a), short: ayAdi(a, true), value: m.get(a) || 0 }));
    }
    case 'teslimGun':
    case 'iadeGun': {
      // Isı haritası: satır = iş günü, sütun = ay. Hücre değeri yalnızca renk için kullanılır.
      const col = state.view === 'teslimGun' ? C.tg : C.ig;
      const cell = new Map();
      rows.forEach((r) => {
        if (IS_GUNLERI.indexOf(r[col]) === -1) return;
        const key = r[col] + '|' + r[C.ay];
        cell.set(key, (cell.get(key) || 0) + r[C.n]);
      });
      return {
        heat: true,
        rows: IS_GUNLERI.map((g) => ({ label: GUNLER[g], short: GUN_KISA[g] })),
        cols: yil.aylar.map((a) => ({ label: ayAdi(a), short: ayAdi(a, true) })),
        value: (ri, ci) => cell.get(IS_GUNLERI[ri] + '|' + yil.aylar[ci]) || 0,
        rowTotals: IS_GUNLERI.map((g) => yil.aylar.reduce((t, a) => t + (cell.get(g + '|' + a) || 0), 0)),
      };
    }
    case 'teslimSaat':
      return hourItems(sumBy(rows, C.ts));
    case 'iadeSaat':
      return hourItems(sumBy(rows, C.is));
    default:
      return [];
  }
}

function kpis(data, state) {
  const rows = data.yillar[state.yil].kayit;
  const ay = maxEntry(sumBy(rows, C.ay));
  const iade = maxEntry(sumBy(rows, C.ig), (g) => IS_GUNLERI.indexOf(g) === -1);
  const bolum = maxEntry(sumBy(rows, C.bolum), (k) => k === 'Diğer');
  return {
    rez: num.format(rows.reduce((t, r) => t + r[C.n], 0)),
    enAy: ay ? ayAdi(ay[0]) : '—',
    enIade: iade ? GUNLER[iade[0]] : '—',
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
      const labelW = Math.min(300, W * 0.36);
      const valueW = 56;
      const band = H / items.length;
      h = Math.min(48, band * 0.74);
      x = labelW;
      w = Math.max(2, ((W - labelW - valueW) * d.value) / max);
      y = i * band + (band - h) / 2;
      hit = svgEl('rect', { x: 0, y: i * band, width: W, height: band, class: 'hit' });
      g.appendChild(svgEl('text', { x: labelW - 12, y: y + h / 2, class: 'lbl', 'text-anchor': 'end', 'dominant-baseline': 'central' }, d.label));
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
      g.appendChild(svgEl('text', { x: x + w / 2, y: H - bottom + 24, class: 'lbl', 'text-anchor': 'middle' }, d.short || d.label));
    }
    hit.setAttribute('data-i', i);
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', `${d.label}: ${num.format(d.value)} rezervasyon`);
    g.appendChild(hit);
  });
}

// ---- Isı haritası (sayı yok; yoğunluk tek renk tonuyla, açıktan koyuya) ----
// Düzey: 0 = işlem yok, 1–5 = en yoğun hücreye göre beşte birlik dilimler.
function level(v, max) {
  return v ? Math.min(5, Math.ceil((v / max) * 5)) : 0;
}

function drawHeatmap(svg, hm, sel) {
  const W = Math.max(280, svg.clientWidth || svg.parentNode.clientWidth);
  const H = Math.max(200, svg.clientHeight || svg.parentNode.clientHeight);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const labelW = W < 700 ? 52 : 110;
  const bottom = 34;
  const gap = 3;
  const cw = (W - labelW) / hm.cols.length;
  const ch = (H - bottom) / hm.rows.length;
  let max = 1;
  hm.rows.forEach((_, ri) => hm.cols.forEach((__, ci) => { max = Math.max(max, hm.value(ri, ci)); }));
  const g = svg.appendChild(svgEl('g', {}));

  hm.rows.forEach((row, ri) => {
    g.appendChild(svgEl('text', { x: labelW - 12, y: ri * ch + ch / 2, class: 'lbl', 'text-anchor': 'end', 'dominant-baseline': 'central' },
      labelW < 100 ? row.short : row.label));
    hm.cols.forEach((col, ci) => {
      const lv = level(hm.value(ri, ci), max);
      const cls = ['cell', `cell--${lv}`];
      if (sel && (sel[0] !== ri || sel[1] !== ci)) cls.push('cell--dim');
      const cell = svgEl('rect', {
        x: labelW + ci * cw + gap / 2, y: ri * ch + gap / 2, width: cw - gap, height: ch - gap, rx: 4, class: cls.join(' '),
      });
      cell.setAttribute('data-r', ri);
      cell.setAttribute('data-c', ci);
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', `${row.label}, ${col.label}: ${lv ? DUZEYLER[lv - 1] : 'İşlem yok'}`);
      g.appendChild(cell);
    });
  });
  // Dar sütunlarda yalnızca ay adı ("Eyl 25" yerine "Eyl").
  hm.cols.forEach((col, ci) => {
    g.appendChild(svgEl('text', { x: labelW + ci * cw + cw / 2, y: H - bottom + 22, class: 'lbl', 'text-anchor': 'middle' },
      cw < 66 ? col.short.split(' ')[0] : col.short));
  });
  return max;
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
    const latest = years[years.length - 1];

    // Veride bulunmayan görünümler (saat, çok yıl) hiç gösterilmez.
    const views = VIEWS.filter((v) => (!v.saat || years.some((y) => data.yillar[y].saatVar))
      && (!v.cokYil || years.length > 1));
    const DEFAULT = { view: 'bolum', yil: latest };

    const seg = (name, list) => `
      <div class="seg" role="group" data-name="${name}">
        ${list.map((o) => `<button type="button" data-v="${esc(o.id)}" aria-pressed="false">${esc(o.etiket)}</button>`).join('')}
      </div>`;

    el.innerHTML = `
      <div class="st">
        <header class="st-head">
          <h2 class="section-title">Ödünç Cihaz Sistemi Kullanım Bilgileri</h2>
          <dl class="st-kpis">
            <div><dt>Rezervasyon sayısı <span data-k="yil"></span></dt><dd data-k="rez"></dd></div>
            <div><dt>En yoğun ay</dt><dd data-k="enAy"></dd></div>
            <div><dt>En yoğun iade günü</dt><dd data-k="enIade"></dd></div>
            <div><dt>En çok kullanan bölüm</dt><dd data-k="enBolum"></dd></div>
          </dl>
        </header>

        <div class="st-controls">
          ${seg('view', views)}
          ${years.length > 1 ? seg('yil', years.map((y) => ({ id: y, etiket: y }))) : ''}
        </div>

        <section class="st-chart card">
          <p class="st-detail" aria-live="polite"></p>
          <p class="st-note"></p>
          <svg class="st-svg" role="img"></svg>
          <div class="st-legend" aria-hidden="true">
            <span>Sakin</span>
            ${[1, 2, 3, 4, 5].map((lv) => `<i class="cell--${lv}"></i>`).join('')}
            <span>Yoğun</span>
          </div>
        </section>

        <p class="source">Kaynak: Ödünç Cihaz Ofisi rezervasyon kayıtları.</p>
      </div>`;

    const svg = el.querySelector('.st-svg');
    const detail = el.querySelector('.st-detail');
    const note = el.querySelector('.st-note');
    const yilSeg = el.querySelector('.seg[data-name="yil"]');
    const legend = el.querySelector('.st-legend');
    let state = Object.assign({}, DEFAULT);
    let selected = null; // çubuk grafikte indeks, ısı haritasında [satır, sütun]
    let items = [];
    let heatMax = 1;

    // Isı haritasında sayı gösterilmez; yalnızca yoğunluk düzeyi yazılır.
    function heatText() {
      if (selected === null) {
        const best = items.rowTotals.indexOf(Math.max(...items.rowTotals));
        return `En yoğun gün: <strong>${esc(items.rows[best].label)}</strong> · Bir kareye dokunarak ayrıntısını gör.`;
      }
      const [ri, ci] = selected;
      const lv = level(items.value(ri, ci), heatMax);
      return `<strong>${esc(items.rows[ri].label)} · ${esc(items.cols[ci].label)}</strong> — ${lv ? DUZEYLER[lv - 1] : 'İşlem yok'}`;
    }

    function detailText() {
      if (items.heat) return heatText();
      if (!items.length) {
        return VIEWS.find((v) => v.id === state.view).saat
          ? `${esc(state.yil)} verisinde saat bilgisi yok.`
          : 'Bu yıl için veri yok.';
      }
      const total = items.reduce((t, d) => t + d.value, 0) || 1;
      if (selected === null) {
        const max = items.reduce((a, d) => (d.value > a.value ? d : a), items[0]);
        return `En yüksek: <strong>${esc(max.label)}</strong> · ${num.format(max.value)} rezervasyon`;
      }
      const d = items[selected];
      return `<strong>${esc(d.label)}</strong> · ${num.format(d.value)} rezervasyon · toplam içindeki payı %${pct.format((d.value / total) * 100)}`;
    }

    function update() {
      items = aggregate(data, state);
      el.querySelectorAll('.seg').forEach((s) => {
        s.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state[s.dataset.name])));
      });
      if (yilSeg) yilSeg.hidden = state.view === 'yillar';
      const k = kpis(data, state);
      Object.keys(k).forEach((key) => { el.querySelector(`[data-k="${key}"]`).textContent = k[key]; });
      el.querySelector('[data-k="yil"]').textContent = years.length > 1 ? `· ${state.yil}` : '';
      const view = VIEWS.find((v) => v.id === state.view);
      note.textContent = view.not || '';
      note.hidden = !view.not;
      svg.setAttribute('aria-label', `${view.etiket} ${view.isi ? 'yoğunluk haritası' : 'grafiği'}`);
      legend.hidden = !items.heat;
      if (items.heat) heatMax = drawHeatmap(svg, items, selected);
      else drawChart(svg, items, { horizontal: state.view === 'bolum', selected });
      detail.innerHTML = detailText();
    }

    el.querySelector('.st-controls').addEventListener('click', (e) => {
      const btn = e.target.closest('.seg button');
      if (!btn) return;
      state[btn.parentNode.dataset.name] = btn.dataset.v;
      selected = null;
      update();
    });

    svg.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) {
        const rc = [Number(cell.getAttribute('data-r')), Number(cell.getAttribute('data-c'))];
        selected = selected && selected[0] === rc[0] && selected[1] === rc[1] ? null : rc;
        update();
        return;
      }
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
      update();
    };
    update();
  },

  // Hareketsizlikte varsayılan grafiğe (son yıl, bölüm) dön.
  reset() {
    resetState();
  },
};
