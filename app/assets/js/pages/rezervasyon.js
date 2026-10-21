// Sayfa 1 — Ödünç Cihaz Sistemi: rezervasyon QR kodu ve ödünç alma kuralları.
// Kiosk'ta giriş yapılmaz; öğrenci QR ile siteyi kendi telefonunda açar (AGENTS.md 3.6).

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default {
  id: 'rezervasyon',
  title: 'Ödünç Cihaz Sistemi',

  async render(el, config) {
    const res = await fetch('data/kurallar.json');
    if (!res.ok) throw new Error('kurallar.json yüklenemedi: ' + res.status);
    const data = await res.json();
    const host = config.reservationUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const cards = data.kurallar.map((k) => `
      <li class="rule${k.vurgu ? ' rule--warn' : ''}">
        <span class="rule-no" aria-hidden="true">${k.no}</span>
        <div>
          <h3 class="rule-title">${esc(k.baslik)}</h3>
          <p class="rule-text">${esc(k.kisa)}</p>
        </div>
      </li>`).join('');

    el.innerHTML = `
      <div class="rz">
        <section class="rz-qr card" aria-labelledby="rz-qr-title">
          <p class="eyebrow">Cihaz ödünç almak ister misin?</p>
          <h2 id="rz-qr-title" class="rz-qr-title">
            <span class="kiosk-only">QR kodu telefonunla okut</span>
            <span class="phone-only">Ödünç Cihaz Sistemi'ne gir</span>
          </h2>
          <div class="rz-qr-code kiosk-only">
            <img src="assets/img/qr-odunccihaz.svg" alt="Ödünç Cihaz Sistemi QR kodu: ${esc(host)}"
                 width="320" height="320" draggable="false">
          </div>
          <!-- Telefonda QR okutulamaz; doğrudan bağlantı verilir (kiosk'ta gizli, AGENTS.md 3.6). -->
          <a class="btn btn--primary rz-link phone-only" href="${esc(config.reservationUrl)}" rel="noopener">Ödünç Cihaz Sistemi'ne git</a>
          <p class="rz-url">${esc(host)}</p>
          <ol class="rz-steps">
            <li><span>1</span><em class="kiosk-only">Telefonunun kamerasını QR koda tut.</em><em class="phone-only">Yukarıdaki düğmeye dokun.</em></li>
            <li><span>2</span>YAŞAR ID ve şifrenle giriş yap.</li>
            <li><span>3</span>Kuralları onayla, talep formunu doldur.</li>
          </ol>
          <p class="rz-note kiosk-only">Güvenliğin için bu ekranda giriş yapılmaz.</p>
        </section>

        <section class="rz-rules" aria-labelledby="rz-rules-title">
          <h2 id="rz-rules-title" class="section-title">Ödünç alma kuralları</h2>
          <ol class="rules">${cards}</ol>
          <p class="source">Kuralların tam metni: ${esc(host)} · Son kontrol: ${esc(formatDate(data.sonKontrol))}</p>
        </section>
      </div>`;
  },
};

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
