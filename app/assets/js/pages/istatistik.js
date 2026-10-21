// Sayfa 3 — Kullanım istatistikleri: kullanıcının seçtiği etkileşimli grafikler.
// Veri: data/istatistik.json (tools/veri/istatistik_olustur.py ile Excel'den üretilir;
// yalnızca anonim sayımlar). Grafikler kütüphanesiz, satır içi SVG'dir (AGENTS.md 3.5).

const VIEWS = [
  { id: 'bolum', etiket: 'Bölüm' },
  { id: 'sinif', etiket: 'Sınıf' },
  { id: 'ay', etiket: 'Aylar' },
  { id: 'gun', etiket: 'Haftanın günü' },
];
const KITLE = [
  { id: 'tum', etiket: 'Tüm kullanıcılar' },
  { id: 'ogrenci', etiket: 'Yalnızca öğrenciler' },
];
const OLCU = [
  { id: 'rez', etiket: 'Rezervasyon' },
  { id: 'kisi', etiket: 'Kişi' },
];
const DEFAULT = { view: 'bolum', kitle: 'tum', olcu: 'rez' };

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const GUN_KISA = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const SINIFLAR = [
  { id: '1', etiket: '1. sınıf' },
  { id: '2', etiket: '2. sınıf' },
  { id: '3', etiket: '3. sınıf' },
  { id: '4', etiket: '4. sınıf' },
  { id: '0', etiket: 'Sınıf bilgisi yok / personel' },
];

const SVG_NS = 'http://www.w3.org/2000/svg';
const num = new Intl.NumberFormat('tr-TR');
const pct = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Personel birimleri istatistik betiğinde "(personel)" ekiyle adlandırılır.
const isPersonel = (bolum) => bolum.indexOf('(personel)') !== -1;

function ayAdi(key, kisa) {
  const [y, m] = key.split('-').map(Number);
  return kisa ? `${AY_KISA[m - 1]} ${String(y).slice(2)}` : `${AYLAR[m - 1]} ${y}`;
}

function tarihYaz(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${AYLAR[m - 1]} ${y}`;
}

// ---- Veriden grafik kalemleri ----
function aggregate(data, state) {
  // Öğrenci = sınıf bilgisi 1–4 olan ve personel biriminde olmayan kayıt.
  const ogrenci = state.kitle === 'ogrenci';
  const keep = (r) => !ogrenci || (r[1] !== '0' && !isPersonel(r[0]));
  const rez = data.rezervasyon.filter(keep);
  const kul = data.kullanici.filter(keep);
  const kulAy = data.kullaniciAy.filter(keep);
  const sum = (rows, keyIdx, valIdx) => rows.reduce((m, r) => m.set(r[keyIdx], (m.get(r[keyIdx]) || 0) + r[valIdx]), new Map());
  const kisi = state.olcu === 'kisi';

  let items;
  if (state.view === 'bolum') {
    const m = kisi ? sum(kul, 0, 2) : sum(rez, 0, 4);
    items = Array.from(m, ([label, value]) => ({ label, value }))
      .sort((a, b) => (a.label === 'Diğer') - (b.label === 'Diğer') || b.value - a.value);
  } else if (state.view === 'sinif') {
    const m = kisi ? sum(kul, 1, 2) : sum(rez, 1, 4);
    items = SINIFLAR.filter((s) => !ogrenci || s.id !== '0')
      .map((s) => ({ label: s.etiket, short: s.id === '0' ? 'Bilgi yok' : s.etiket, value: m.get(s.id) || 0 }));
  } else if (state.view === 'ay') {
    const m = kisi ? sum(kulAy, 2, 3) : sum(rez, 2, 4);
    items = data.aylar.map((a) => ({ label: ayAdi(a), short: ayAdi(a, true), value: m.get(a) || 0 }));
  } else {
    const m = sum(rez, 3, 4);
    items = GUNLER.map((g, i) => ({ label: g, short: GUN_KISA[i], value: m.get(i) || 0 }));
  }

  // Özet kutuları seçili kitleye göre (her zaman rezervasyon / kişi toplamları).
  const ayRez = sum(rez, 2, 4);
  const bolRez = sum(rez, 0, 4);
  const top = (m, skip) => Array.from(m).filter(([k]) => !skip(k)).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
  const enAy = top(ayRez, () => false);
  const enBolum = top(bolRez, (k) => k === 'Diğer' || isPersonel(k));
  return {
    items,
    kpi: {
      rez: rez.reduce((t, r) => t + r[4], 0),
      kisi: kul.reduce((t, r) => t + r[2], 0),
      enAy: enAy[0] === '—' ? '—' : ayAdi(enAy[0]),
      enBolum: enBolum[0],
    },
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

  const max = Math.max(1, ...items.map((d) => d.value));
  const maxIdx = items.findIndex((d) => d.value === max);
  const sel = opts.selected;
  const horizontal = opts.horizontal;
  const g = svg.appendChild(svgEl('g', {}));

  items.forEach((d, i) => {
    let x; let y; let w; let h; let band;
    let hit;
    const cls = ['bar'];
    if (i === maxIdx) cls.push('bar--max');
    if (sel !== null && sel !== i) cls.push('bar--dim');
    if (sel === i) cls.push('bar--sel');

    if (horizontal) {
      const labelW = Math.min(300, W * 0.36);
      const valueW = 56;
      band = H / items.length;
      const bh = Math.min(34, band * 0.62);
      x = labelW;
      w = Math.max(2, ((W - labelW - valueW) * d.value) / max);
      y = i * band + (band - bh) / 2;
      h = bh;
      hit = svgEl('rect', { x: 0, y: i * band, width: W, height: band, class: 'hit' });
      g.appendChild(svgEl('text', { x: labelW - 12, y: y + h / 2, class: 'lbl', 'text-anchor': 'end', 'dominant-baseline': 'central' }, d.label));
      g.appendChild(svgEl('path', { d: barPath(x, y, w, h, true), class: cls.join(' ') }));
      g.appendChild(svgEl('text', { x: x + w + 8, y: y + h / 2, class: 'val', 'dominant-baseline': 'central' }, num.format(d.value)));
    } else {
      const top = 30;
      const bottom = 40;
      const plotH = H - top - bottom;
      band = W / items.length;
      const bw = Math.min(64, band * 0.62);
      h = Math.max(2, (plotH * d.value) / max);
      x = i * band + (band - bw) / 2;
      y = top + plotH - h;
      w = bw;
      hit = svgEl('rect', { x: i * band, y: 0, width: band, height: H, class: 'hit' });
      g.appendChild(svgEl('path', { d: barPath(x, y, w, h, false), class: cls.join(' ') }));
      g.appendChild(svgEl('text', { x: x + w / 2, y: y - 8, class: 'val', 'text-anchor': 'middle' }, num.format(d.value)));
      g.appendChild(svgEl('text', { x: x + w / 2, y: H - bottom + 24, class: 'lbl', 'text-anchor': 'middle' }, d.short || d.label));
    }
    hit.setAttribute('data-i', i);
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', `${d.label}: ${num.format(d.value)}`);
    g.appendChild(hit);
  });

  // Taban çizgisi (dikey grafiklerde)
  if (!horizontal) {
    g.insertBefore(svgEl('line', { x1: 0, x2: W, y1: H - 40 + 0.5, y2: H - 40 + 0.5, class: 'base' }), g.firstChild);
  }
}

// ---- Sayfa ----
let resetState = () => {};

export default {
  id: 'istatistik',
  title: 'Kullanım istatistikleri',
  durationSec: 40,

  async render(el) {
    const res = await fetch('data/istatistik.json');
    if (!res.ok) throw new Error('istatistik.json yüklenemedi: ' + res.status);
    const data = await res.json();

    const seg = (name, list) => `
      <div class="seg" role="group" data-name="${name}">
        ${list.map((o) => `<button type="button" data-v="${o.id}" aria-pressed="false">${esc(o.etiket)}</button>`).join('')}
      </div>`;

    el.innerHTML = `
      <div class="st">
        <header class="st-head">
          <div>
            <h2 class="section-title">Ödünç Cihaz Sistemi'ni kimler kullandı?</h2>
            <p class="st-sub">${esc(tarihYaz(data.donem.baslangic))} – ${esc(tarihYaz(data.donem.bitis))}</p>
          </div>
          <dl class="st-kpis">
            <div><dt>Rezervasyon</dt><dd data-k="rez"></dd></div>
            <div><dt>Farklı kullanıcı</dt><dd data-k="kisi"></dd></div>
            <div><dt>En yoğun ay</dt><dd data-k="enAy"></dd></div>
            <div><dt>En çok kullanan bölüm</dt><dd data-k="enBolum"></dd></div>
          </dl>
        </header>

        <div class="st-controls">
          ${seg('view', VIEWS)}
          <div class="st-filters">
            ${seg('kitle', KITLE)}
            ${seg('olcu', OLCU)}
          </div>
        </div>

        <section class="st-chart card">
          <p class="st-detail" aria-live="polite"></p>
          <svg class="st-svg" role="img"></svg>
        </section>

        <p class="source">Kaynak: Ödünç Cihaz Ofisi rezervasyon kayıtları. Her kayıt bir rezervasyondur (cihaz adedi değildir).
          5 kişiden az kullanıcısı olan birimler "Diğer" altındadır. Grafikteki bir çubuğa dokunarak ayrıntısını gör.</p>
      </div>`;

    const svg = el.querySelector('.st-svg');
    const detail = el.querySelector('.st-detail');
    const olcuSeg = el.querySelector('.seg[data-name="olcu"]');
    let state = Object.assign({}, DEFAULT);
    let selected = null;
    let current = null;

    function detailText() {
      const items = current.items;
      const total = items.reduce((t, d) => t + d.value, 0) || 1;
      const birim = state.view !== 'gun' && state.olcu === 'kisi' ? 'kişi' : 'rezervasyon';
      if (selected === null) {
        const max = items.reduce((a, d) => (d.value > a.value ? d : a), items[0]);
        return `En yüksek: <strong>${esc(max.label)}</strong> · ${num.format(max.value)} ${birim}`;
      }
      const d = items[selected];
      return `<strong>${esc(d.label)}</strong> · ${num.format(d.value)} ${birim} · toplam içindeki payı %${pct.format((d.value / total) * 100)}`;
    }

    function update() {
      current = aggregate(data, state);
      el.querySelectorAll('.seg').forEach((s) => {
        s.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state[s.dataset.name])));
      });
      // Haftanın günü için kişi sayısı toplanamaz; ölçü seçimi gizlenir.
      olcuSeg.hidden = state.view === 'gun';
      Object.keys(current.kpi).forEach((k) => {
        const v = current.kpi[k];
        el.querySelector(`[data-k="${k}"]`).textContent = typeof v === 'number' ? num.format(v) : v;
      });
      svg.setAttribute('aria-label', `${VIEWS.find((v) => v.id === state.view).etiket} grafiği`);
      drawChart(svg, current.items, { horizontal: state.view === 'bolum', selected });
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
      raf = requestAnimationFrame(() => { if (current) update(); });
    }).observe(svg);

    resetState = () => {
      state = Object.assign({}, DEFAULT);
      selected = null;
      update();
    };
    update();
  },

  // Hareketsizlikte varsayılan grafiğe dön.
  reset() {
    resetState();
  },
};
