// Hareketsizlik zamanlayıcısı: dokunma/klavye/kaydırma olmadan `timeoutSec` geçerse
// onIdle(), ilk etkileşimde onActive() çağrılır. Tek bir 1 sn'lik sayaç kullanır.

const EVENTS = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];

export function createIdleTimer({ timeoutSec, onIdle, onActive }) {
  let last = Date.now();
  let idle = true; // Açılışta kiosk boşta kabul edilir (otomatik geçiş çalışır).

  function touch() {
    last = Date.now();
    if (idle) {
      idle = false;
      onActive();
    }
  }

  EVENTS.forEach((type) => {
    document.addEventListener(type, touch, { passive: true, capture: true });
  });

  function tick() {
    if (!idle && Date.now() - last >= timeoutSec * 1000) {
      idle = true;
      onIdle();
    }
  }

  return {
    tick,
    isIdle: () => idle,
    // Uygulama arka plandan dönünce vb. durumlarda boşta durumuna zorla.
    reset() {
      idle = true;
      onIdle();
    },
  };
}
