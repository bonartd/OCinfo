// Sayfa 1 — Ödünç Cihaz Sistemi: rezervasyon QR kodu ve ödünç alma kuralları (simgeli kartlar).
// Kiosk'ta giriş yapılmaz; öğrenci QR ile siteyi kendi telefonunda açar (AGENTS.md 3.6).
// Ekrandaki kısa metinler data/kurallar.json → "ekran" bölümündedir; resmî metin aynı dosyada.

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// 24×24 çizgi simgeler (stroke ile çizilir; renk CSS'ten gelir).
const ICONS = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  bir: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10.5 9.5l2-1.5v8.5"/>',
  takvim: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  onay: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  kisi: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  kontrol: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  kutu: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  uyari: '<path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4.5M12 17.3v.2"/>',
  kamera: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7l1.5-3h4l1.5 3"/>',
  dokun: '<path d="M9 11V5.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V11m0-.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1a6 6 0 01-5-2.7L4.5 15a1.6 1.6 0 012.6-1.8L9 15"/>',
  giris: '<path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"/><path d="M4 12h11M11 8l4 4-4 4"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  saat: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export default {
  id: 'rezervasyon',
  title: 'Ödünç Cihaz Sistemi',

  async render(el, config) {
    const res = await fetch('data/kurallar.json');
    if (!res.ok) throw new Error('kurallar.json yüklenemedi: ' + res.status);
    const data = await res.json();
    const ekran = data.ekran;
    const host = config.reservationUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const z = ekran.zaman;

    // Animasyon sırası (--i): QR kartı, başlık, zaman şeridi, kartlar.
    const tiles = ekran.kartlar.map((k, i) => `
      <li class="tile anim${k.vurgu ? ' tile--warn' : ''}" style="--i:${i + 3}">
        <span class="tile-ico">${icon(k.ikon)}</span>
        <h3 class="tile-title">${esc(k.baslik)}</h3>
        <p class="tile-alt">${esc(k.alt)}</p>
      </li>`).join('');

    el.innerHTML = `
      <div class="rz">
        <section class="rz-qr card anim" style="--i:0" aria-labelledby="rz-qr-title">
          <h2 id="rz-qr-title" class="rz-qr-title">
            <span class="kiosk-only">Rezervasyon için okut</span>
            <span class="phone-only">Rezervasyon yap</span>
          </h2>
          <div class="rz-qr-code kiosk-only">
            <img src="assets/img/qr-odunccihaz.svg" alt="Ödünç Cihaz Sistemi QR kodu: ${esc(host)}"
                 width="320" height="320" draggable="false">
          </div>
          <!-- Telefonda QR okutulamaz; doğrudan bağlantı verilir (kiosk'ta gizli, AGENTS.md 3.6). -->
          <a class="btn btn--primary rz-link phone-only" href="${esc(config.reservationUrl)}" rel="noopener">Ödünç Cihaz Sistemi'ne git</a>
          <p class="rz-url">${esc(host)}</p>
          <ol class="rz-steps" aria-label="Adımlar">
            <li><span class="kiosk-only">${icon('kamera')}</span><span class="phone-only">${icon('dokun')}</span><b class="kiosk-only">Okut</b><b class="phone-only">Dokun</b></li>
            <li aria-hidden="true" class="rz-arrow">›</li>
            <li>${icon('giris')}<b>Giriş yap</b></li>
            <li aria-hidden="true" class="rz-arrow">›</li>
            <li>${icon('form')}<b>Talep et</b></li>
          </ol>
        </section>

        <section class="rz-rules" aria-labelledby="rz-rules-title">
          <h2 id="rz-rules-title" class="section-title anim" style="--i:1">Ödünç alma kuralları</h2>

          <div class="rz-time card anim" style="--i:2" role="img"
               aria-label="Teslim alma en erken ${esc(z.teslim)}, en fazla ${z.enFazlaGun} gün, iade en geç ${esc(z.iade)}">
            <div class="rz-time-end">
              <span class="rz-time-label">Teslim al</span>
              <span class="rz-time-val"><small>en erken</small> ${esc(z.teslim)}</span>
            </div>
            <div class="rz-time-track" aria-hidden="true">
              <span class="rz-time-dot"></span>
              <span class="rz-time-line"></span>
              <span class="rz-time-pill">${icon('saat')} en fazla ${z.enFazlaGun} gün</span>
              <span class="rz-time-dot rz-time-dot--end"></span>
            </div>
            <div class="rz-time-end rz-time-end--right">
              <span class="rz-time-label">İade et</span>
              <span class="rz-time-val"><small>en geç</small> ${esc(z.iade)}</span>
            </div>
          </div>

          <ul class="tiles">${tiles}</ul>
          <p class="source anim" style="--i:11">Kuralların tam metni: ${esc(host)}</p>
        </section>
      </div>`;
  },
};
