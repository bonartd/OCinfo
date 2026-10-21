// OCinfo ayarları — kiosk davranışı buradan değiştirilir.
export const config = {
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
  // Memnuniyet anketi yanıtlarının gönderileceği Google Apps Script web uygulaması adresi
  // (docs/ANKET_KURULUM.md). Boşken yanıtlar iPad'de kuyrukta bekler, adres girilince gönderilir.
  surveyEndpoint: '',
};
