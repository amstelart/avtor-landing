// Если на проекте jQuery
$( document ).ready(function() {

  $('.gallery-item').magnificPopup({
    type: 'image',
    gallery:{
      enabled:true
    }
  });

  //animate header
  var fixNav = 120;
  $(window).scroll(function() {
    var scroll = $(this).scrollTop();
    if ( scroll >= fixNav ) {
        $('.navbar').addClass('navbar--sticky');
      }
      else {
          $('.navbar').removeClass('navbar--sticky');
      }
  });
  //animate header end

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
      	'scrollTop': target.offset().top - mainNav.height() + 1
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
      'scrollTop': target.offset().top - mainNav.height() + 1
      }, 400
    );
  });

  // https://github.com/digitalBush/jquery.maskedinput
  $(".phone-mask").mask("+7(999) 999-9999");

  // https://www.jqueryscript.net/time-clock/psg-countdown-timer.html
  var timer = new PsgTimer({
      selector: '#avtorTimer',
      currentDateTime: Date.UTC(2019, 10, 14, 12, 0, 0),
      endDateTime: Date.UTC(2019, 10, 31, 12, 0, 0),
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
    items: 1,
    nav: true,
    dots: false,
    loop: true,
    margin: 15,
    center: false,
    navText: ["<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='15px' height='25px'><path fill-rule='evenodd'  fill='rgb(0, 0, 0)'' d='M0.504,10.830 L11.070,0.496 C11.742,-0.160 12.832,-0.160 13.504,0.496 C14.176,1.153 14.176,2.219 13.504,2.876 L4.154,12.019 L13.503,21.162 C14.175,21.819 14.175,22.885 13.503,23.542 C12.832,24.198 11.742,24.198 11.070,23.542 L0.503,13.208 C0.167,12.880 -0.000,12.450 -0.000,12.019 C-0.000,11.589 0.168,11.158 0.504,10.830 Z'/></svg>","<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='14px' height='25px'><path fill-rule='evenodd'  fill='rgb(0, 0, 0)' d='M13.496,10.830 L2.930,0.496 C2.257,-0.160 1.168,-0.160 0.496,0.496 C-0.176,1.153 -0.176,2.219 0.496,2.876 L9.846,12.019 L0.496,21.162 C-0.175,21.819 -0.175,22.885 0.496,23.542 C1.168,24.198 2.258,24.198 2.930,23.542 L13.497,13.208 C13.832,12.880 14.000,12.450 14.000,12.019 C14.000,11.589 13.832,11.158 13.496,10.830 Z'/></svg>"]
  });
});
