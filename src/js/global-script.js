// Если на проекте jQuery
$( document ).ready(function() {

  var mainNav = $('.navbar'),
      contentSections = $('.scroll-section');

  $(window).on('scroll', function(){

		//on desktop - update the active link in the secondary fixed navigation
		updatemainNavigation();
	});

  function updatemainNavigation() {
		contentSections.each(function(){
			var actual = $(this),
				actualHeight = actual.height() + parseInt(actual.css('paddingTop').replace('px', '')) + parseInt(actual.css('paddingBottom').replace('px', '')),
				actualAnchor = mainNav.find('a[href="#'+actual.attr('id')+'"]');
			if ( ( actual.offset().top - mainNav.height() <= $(window).scrollTop() ) && ( actual.offset().top +  actualHeight - mainNav.height() > $(window).scrollTop() ) ) {
				actualAnchor.addClass('active');
			}else {
				actualAnchor.removeClass('active');
			}
		});
	}

  //smooth scrolling when clicking on the secondary navigation items
	mainNav.find('ul a').on('click', function(event){
      event.preventDefault();
      var target= $(this.hash);
      $('body,html').animate({
      	'scrollTop': target.offset().top + 1
      	}, 400
      );
      //on mobile - close secondary navigation
      $('.navbar-toggler').addClass('collapsed');
      mainNav.find('.navbar-collapse').removeClass('show');
  });

  $('.scroll-link').on('click', function(event){
    event.preventDefault();
    var target= $(this.hash);
    $('body,html').animate({
      'scrollTop': target.offset().top + 1
      }, 400
    );
  });

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
    center: true,
    responsive : {
      0:{
        items: 1,
        nav: false
      },
      480:{
        items: 2,
        nav: true
      }
    }
  });
});
