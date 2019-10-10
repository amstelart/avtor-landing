// Если на проекте jQuery
$( document ).ready(function() {
  // https://github.com/digitalBush/jquery.maskedinput
  $(".phone-mask").mask("+7(999) 999-9999");

  // https://www.jqueryscript.net/time-clock/psg-countdown-timer.html
  var timer = new PsgTimer({
      selector: '#zefricaTimer',
      currentDateTime: Date.UTC(2018, 0, 26, 12, 0, 0),
      endDateTime: 'UTC+02:00 26.02.2018 13:00:00',
      multilpeBlocks: true,
      animation: 'fade',
      labels: {
          days: 'Дней',
          hours: 'Часов',
          minutes: 'Минут',
          seconds: 'Секунд'
      },
      callbacks: {
          onInit: function () {
              console.log('Hello world!');
          }
      }
  });

  $(".adv-slider").owlCarousel({
    items: 2,
    nav: true,
    dots: false,
    loop: true,
    margin: 15,
    center: true
  });
});
