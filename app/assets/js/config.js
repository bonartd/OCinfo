// OCinfo ayarları — kiosk davranışı buradan değiştirilir.
export const config = {
  // Uygulama sürümü (kullanım loguna yazılır). sw.js'deki CACHE ile BİRLİKTE güncelleyin.
  appVersion: 'ocinfo-v19',
  // Hiç dokunulmazsa ilk sayfaya dönüş ve otomatik geçişin yeniden başlaması (saniye)
  idleTimeoutSec: 90,
  // Otomatik geçişte her sayfanın varsayılan ekranda kalma süresi (saniye).
  // Sayfa kendi "durationSec" değerini verirse o kullanılır.
  rotationSec: 30,
  // Uzun süreli çalışma için her gece bu saatte (0–23) sessizce yeniden yükle.
  // Kapatmak için null yapın.
  nightlyReloadHour: 4,
  // Ödünç Cihaz Sistemi (rezervasyon) adresi — QR kod bu adrese yönlendirir.
  // Değişirse assets/img/qr-odunccihaz.svg de yeniden üretilmelidir.
  reservationUrl: 'https://odunccihaz.yasar.edu.tr/',
  // Ekranın kısa kenarı bundan küçükse (px) telefon kabul edilir: kiosk davranışları kapanır,
  // Sayfa 1'de QR yerine rezervasyon düğmesi gösterilir.
  phoneMaxShortSide: 600,
  // Bir anket yanıtından sonra yeni yanıt alınmadan önce beklenecek süre (saniye).
  // Şimdilik kapalı (0); yoğunluk/kötüye kullanım olursa ör. 60 yapın.
  surveyCooldownSec: 0,
  // Memnuniyet anketi yanıtlarının gönderileceği Google Apps Script web uygulaması adresi
  // (docs/ANKET_KURULUM.md). Boşken yanıtlar iPad'de kuyrukta bekler, adres girilince gönderilir.
  surveyEndpoint: 'https://script.google.com/macros/s/AKfycbymnv8CoAwFrMxn6SoeNmGLDYU8oWaXQXppWdbezJ1TAP7vWgOdaURk2rN8KogQQobbpg/exec',
};
