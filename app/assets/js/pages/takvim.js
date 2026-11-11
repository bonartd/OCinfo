// Sayfa 3 — Rezervasyon takvimi: Ödünç Cihaz Sistemi'nin herkese açık takvim sayfası tam sayfa
// çerçevede gösterilir. Ortak iPad'de kimlik bilgisi girilmemesi için (AGENTS.md 3.6):
// - çerçeve sandbox'lıdır: form gönderilemez, açılır pencere ve üst pencereye geçiş yoktur;
// - çerçeve takvim dışında bir adrese giderse (ör. "Sisteme giriş") hemen takvime döner.
// Çerçevenin içindeki dokunuşlar kiosk'a ulaşmaz; bu yüzden üstünde saydam bir perde durur.
// Perdeye ilk dokunuş kiosk'a "kullanıcı var" der (otomatik geçiş durur, kaydırma ile sayfa
// değişebilir) ve perde kalkar; sonraki dokunuşlar takvimi kaydırır. Perde PERDE_SN sonra geri
// gelir ki takvimi kullanan kişi hareketsiz sayılıp sayfa elinden alınmasın.

const URL_TAKVIM = 'https://odunccihaz.yasar.edu.tr/takvim/';
const PERDE_SN = 15;
const YENILE_DK = 10; // takvim bu aralıkla tazelenir (perde açıkken, yani kimse kullanmıyorken)

let sifirla = () => {};

export default {
  id: 'takvim',
  title: 'Rezervasyon takvimi',

  render(el) {
    el.classList.add('page--frame');
    el.innerHTML = `
      <div class="tk">
        <p class="tk-yukleniyor">Takvim yükleniyor…</p>
        <iframe class="tk-frame" title="Rezervasyon takvimi" referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"></iframe>
        <div class="tk-perde" aria-hidden="true"></div>
      </div>`;
    const frame = el.querySelector('.tk-frame');
    const perde = el.querySelector('.tk-perde');
    let beklenen = false; // bir sonraki load bizim başlattığımız yükleme mi
    let perdeZamani = null;
    let sonYukleme = 0;

    const yukle = () => {
      beklenen = true;
      sonYukleme = Date.now();
      frame.src = URL_TAKVIM;
    };
    frame.addEventListener('load', () => {
      if (beklenen) { beklenen = false; return; }
      // Kullanıcı çerçeve içinde başka sayfaya geçti (giriş vb.): takvime dön.
      yukle();
    });

    const perdeKapat = () => {
      perde.hidden = false;
      clearTimeout(perdeZamani);
    };
    const perdeKaldir = () => {
      perde.hidden = true;
      clearTimeout(perdeZamani);
      perdeZamani = setTimeout(perdeKapat, PERDE_SN * 1000);
    };
    // Dokunuş perdede başladığı için bu hareketin touchend'i yine sahneye (kaydırma) ulaşır.
    perde.addEventListener('touchstart', perdeKaldir, { passive: true });
    // Farede perde tıklamayla kalkar (masaüstünde deneme için).
    perde.addEventListener('click', perdeKaldir);

    setInterval(() => {
      if (perde.hidden || Date.now() - sonYukleme < YENILE_DK * 60000) return;
      yukle();
    }, 60000);

    sifirla = () => {
      perdeKapat();
      yukle();
    };
    yukle();
  },

  // Hareketsizlikte takvim baştan yüklenir (kaydırma konumu ve olası gezinme sıfırlanır).
  reset() {
    sifirla();
  },
};
