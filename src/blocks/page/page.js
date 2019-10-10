(function () {
    var callbacks = {
        onInit: function () {
        },
        onStart: function () {
        },
        onStop: function () {
        },
        onEnd: function () {
        },
        onChangeStart: function () {
        },
        onChangeEnd: function () {
        }
    };

    var base = {
        stopped: true,
        timezone: 0,
        diff: null,
        isEnd: false
    };

    var PsgTimer = function (selector, options) {
        var timer = this;
        if (selector.nodeType === Node.ELEMENT_NODE) {
            timer.container = $(selector);
        } else if (typeof selector === 'string') {
            timer.selector = selector;
            timer.container = $(timer.selector);
        } else if (typeof selector === 'object') {
            options = selector;
            timer.selector = options.selector;
            timer.container = $(timer.selector);
        }

        timer.options = $.extend({}, {
            selector: '#psgTimer',
            animation: false,
            multipleBlocks: false,
            endDateTime: undefined,
            // currentDateTime: window.serverTime['U'] * 1000 || Date.now(),
            currentDateTime: Date.now(),
            labels: {
                days:     timer.container.attr('data-label-days')    ? timer.container.attr('data-label-days') : false,
                hours:    timer.container.attr('data-label-hours')   ? timer.container.attr('data-label-hours') : false,
                minutes:  timer.container.attr('data-label-minutes') ? timer.container.attr('data-label-minutes') : false,
                seconds:  timer.container.attr('data-label-seconds') ? timer.container.attr('data-label-seconds') : false
            }
        }, options);

        timer.callbacks = timer.options.callbacks = $.extend({}, callbacks, timer.options.callbacks);
        timer.base = $.extend({}, base);

        if (typeof timer.options.endDateTime === 'string') {
            timer.options.endDateTime = setTimerEndFromString(timer, timer.options.endDateTime);
        }

        timer.container.length ? timer.init() : console.log('No timer element on this page');
    };

    PsgTimer.prototype.init = function () {
        var timer = this,
            options = this.options;

        var timerEnd = timer.container.attr('data-timer-end');

        if (timerEnd !== undefined) {
            options.endDateTime = setTimerEndFromString(timer, timerEnd);
        }

        // options.endDateTime = options.endDateTime + (timer.base.timezone * 1000 * 60 * 60);

        timer.countdown = transformCountToArray(getCurrentCountDown(timer), options.multilpeBlocks);

        timer.container.addClass('psgTimer').append(createMarkup(timer));
        if (options.animation) {
            timer.container.addClass('psgTimer_' + options.animation);
        }

        timer.query = setQueries(timer);
        timer.callbacks.onInit();

        if (!timer.base.isEnd) {
            timer.start();
        }
    };

    PsgTimer.prototype.start = function () {
        var timer = this;

        if (timer.base.stopped) {
            timer.base.stopped = false;

            timer.intervalId = setInterval(function () {
                updateCounter(timer);
            }, 1000);

            timer.callbacks.onStart();
        }
    };

    PsgTimer.prototype.restart = function () {
        var timer = this;
        timer.options.currentDateTime = Date.now();
        timer.start();
    };

    PsgTimer.prototype.stop = function () {
        var timer = this;
        timer.base.stopped = true;
        clearTimeout(timer.intervalId);

        timer.callbacks.onStop();
    };


    var getCurrentCountDown = function (timer) {
        var options = timer.options;
        var base = timer.base;

        options.currentDateTime = options.currentDateTime + 1001;
        base.diff = options.endDateTime - options.currentDateTime;

        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var days = 0;

        if (base.diff > 0) {
            var total = parseFloat(((((base.diff / 1000.0) / 60.0) / 60.0) / 24.0));
            days = parseInt(total);
            total -= days;
            total *= 24.0;
            hours = parseInt(total);
            total -= hours;
            total *= 60.0;
            minutes = parseInt(total);
            total -= minutes;
            total *= 60;
            seconds = parseInt(total);
        } else {
            timer.callbacks.onEnd();
            timer.stop();
            timer.base.isEnd = true;
        }

        return {
            days: {
                amount: days,
                max: Infinity,
                className: 'days'
            },
            hours: {
                amount: hours,
                max: 24,
                className: 'hours'
            },
            minutes: {
                amount: minutes,
                max: 60,
                className: 'minutes'
            },
            seconds: {
                amount: seconds,
                max: 60,
                className: 'seconds'
            }
        }
    };

    var transformCountToArray = function (count, multilpeBlocks) {
        if (typeof count === 'object') {
            for (var unit in count) {
                if (count.hasOwnProperty(unit)) {
                    count[unit].amount = count[unit].amount.toString();

                    if (count[unit].amount.length < 2) {
                        count[unit].amount = '0' + count[unit].amount;
                    }

                    if (multilpeBlocks) {
                        count[unit].amount = count[unit].amount.split('');
                    } else {
                        count[unit].amount = [count[unit].amount];
                    }
                }
            }
        }

        return count;
    };

    var getTimeZone = function (string) {
        var hours, minutes;
        var number = string.replace(/\D/g, '');
        var digit = string.replace(/[^+-]/g, '');
        var multiplier = digit === '-' ? (-1) : 1;

        if (number.length >= 3) {
            hours = Number(number.substr(0, number.length - 2));
            minutes = Number(number.substr(number.length - 2, 2));
        } else {
            hours = Number(number);
            minutes = 0;
        }

        return (hours + minutes/60) * multiplier;
    };

    var setTimerEndFromString = function (timer, endTimeString) {
        var timerDate = {};
        var timerEnd = endTimeString.split(' ');
        var endTime;

        var timeExp = /^([0-1]\d|2[0-3])(:[0-5]\d){1,2}$/;
        var dateExp = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
        var zoneExp = /(UTC|GMT)[+-](\d{1,2}([:,.]?\d{2})?)/;

        for (var i = 0; i < timerEnd.length; i++) {
            if (timerEnd[i].match(timeExp)) {
                timerDate.time = timerEnd[i].split(':');
            } else if (timerEnd[i].match(dateExp)) {
                timerDate.date = timerEnd[i].split('.');
            } else if (timerEnd[i].match(zoneExp)) {
                timer.base.timezone = getTimeZone(timerEnd[i]);
            } else {
                console.log('Wrong end time.');
            }
        }

        timerDate.year = parseInt(timerDate.date[2]) || 0;
        timerDate.month = parseInt(timerDate.date[1]) - 1 || 0;
        timerDate.day = parseInt(timerDate.date[0]) || 0;
        timerDate.hours = parseInt(timerDate.time[0]) || 0;
        timerDate.minutes = parseInt(timerDate.time[1]) || 0;
        timerDate.seconds = parseInt(timerDate.time[2]) || 0;
        timerDate.miliseconds = parseInt(timerDate.time[3]) || 0;

        endTime = Date.UTC(timerDate.year, timerDate.month, timerDate.day, timerDate.hours, timerDate.minutes, timerDate.seconds, timerDate.miliseconds);

        return endTime;
    };

    var createMarkup = function (timer) {
        var countdown = timer.countdown;
        var markup = {};

        for (var unit in countdown) {
            if (countdown.hasOwnProperty(unit)) {
                var numberBlocks = '';
                countdown[unit].amount.forEach(function (num) {
                    numberBlocks += numberContainer(timer, num);
                });

                markup.unit += '<div class="' + countdown[unit].className + ' psgTimer_unit">' + numberBlocks + '</div>';
            }
        }

        markup.numbers = '<div class="psgTimer_numbers">' + markup.unit + '</div>';
        markup.full = markup.numbers;

        if (
            timer.options.labels &&
            timer.options.labels.days &&
            timer.options.labels.hours &&
            timer.options.labels.minutes &&
            timer.options.labels.seconds
        ) {
            var labels = timer.options.labels;
            markup.labels = '<div class="psgTimer_labels">' +
                '<div class="days">' + labels.days + '</div>' +
                '<div class="hours">' + labels.hours + '</div>' +
                '<div class="minutes">' + labels.minutes + '</div>' +
                '<div class="seconds">' + labels.seconds + '</div>' +
                '</div>';
            markup.full = markup.numbers + markup.labels;
        } else {

            markup.full = markup.numbers;
        }

        return markup.full;
    };

    var numberContainer = function (timer, num) {
        var markup = '',
            data = 'data-number="' + num + '"';

        var numberBlock = '<div class="number" ' + data + '>' + num + '</div>';

        if (timer.options.animation === 'fade') {
            markup = '<div>' + numberBlock + '</div>';
        } else {
            markup = numberBlock;
        }

        return markup;
    };

    var setQueries = function (timer) {
        var countdown = timer.countdown,
            query = {};

        for (var unit in countdown) {
            if (countdown.hasOwnProperty(unit)) {
                query[unit] = timer.container.find(numberSelector(timer, countdown[unit].className));
            }
        }

        return query;
    };

    var numberSelector = function (timer, className) {
        var selector = '';

        if (timer.options.animation === 'fade') {
            selector = '.' + className + ' .number';
        } else {
            selector = '.' + className + ' .number';
        }

        return selector;
    };

    var updateCounter = function (timer) {
        timer.callbacks.onChangeStart();

        timer.countdown = transformCountToArray(getCurrentCountDown(timer), timer.options.multilpeBlocks);

        for (var unit in timer.countdown) {
            if (timer.countdown.hasOwnProperty(unit)) {
                timer.countdown[unit].amount.forEach(function (number, index) {
                    if (timer.query[unit][index].getAttribute('data-number') !== number) {
                        aminate(timer.query[unit][index], number, timer.options.animation);
                    }
                });
            }
        }

        timer.callbacks.onChangeEnd();
    };

    var aminate = function (el, value, animationType) {
        var $el = $(el);
        $el.attr('data-number', value);

        if (animationType === 'fade') {
            animation.fade($el, value);
        } else {
            $el.html(value);
        }
    };

    var animation = {
        fade: function ($el, value) {
            var animDuration = 350;

            $el.css({
               'transition': 'opacity ' + animDuration + 'ms',
                'opacity': '0'
            });

            setTimeout(function () {
                $el.html(value).css('opacity', 1);
            }, animDuration + 10);
        }
    };

    window.PsgTimer = PsgTimer;
})();

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b,c=navigator.userAgent,d=/iphone/i.test(c),e=/chrome/i.test(c),f=/android/i.test(c);a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},a.fn.extend({caret:function(a,b){var c;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof a?(b="number"==typeof b?b:a,this.each(function(){this.setSelectionRange?this.setSelectionRange(a,b):this.createTextRange&&(c=this.createTextRange(),c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select())})):(this[0].setSelectionRange?(a=this[0].selectionStart,b=this[0].selectionEnd):document.selection&&document.selection.createRange&&(c=document.selection.createRange(),a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length),{begin:a,end:b})},unmask:function(){return this.trigger("unmask")},mask:function(c,g){var h,i,j,k,l,m,n,o;if(!c&&this.length>0){h=a(this[0]);var p=h.data(a.mask.dataName);return p?p():void 0}return g=a.extend({autoclear:a.mask.autoclear,placeholder:a.mask.placeholder,completed:null},g),i=a.mask.definitions,j=[],k=n=c.length,l=null,a.each(c.split(""),function(a,b){"?"==b?(n--,k=a):i[b]?(j.push(new RegExp(i[b])),null===l&&(l=j.length-1),k>a&&(m=j.length-1)):j.push(null)}),this.trigger("unmask").each(function(){function h(){if(g.completed){for(var a=l;m>=a;a++)if(j[a]&&C[a]===p(a))return;g.completed.call(B)}}function p(a){return g.placeholder.charAt(a<g.placeholder.length?a:0)}function q(a){for(;++a<n&&!j[a];);return a}function r(a){for(;--a>=0&&!j[a];);return a}function s(a,b){var c,d;if(!(0>a)){for(c=a,d=q(b);n>c;c++)if(j[c]){if(!(n>d&&j[c].test(C[d])))break;C[c]=C[d],C[d]=p(d),d=q(d)}z(),B.caret(Math.max(l,a))}}function t(a){var b,c,d,e;for(b=a,c=p(a);n>b;b++)if(j[b]){if(d=q(b),e=C[b],C[b]=c,!(n>d&&j[d].test(e)))break;c=e}}function u(){var a=B.val(),b=B.caret();if(o&&o.length&&o.length>a.length){for(A(!0);b.begin>0&&!j[b.begin-1];)b.begin--;if(0===b.begin)for(;b.begin<l&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}else{for(A(!0);b.begin<n&&!j[b.begin];)b.begin++;B.caret(b.begin,b.begin)}h()}function v(){A(),B.val()!=E&&B.change()}function w(a){if(!B.prop("readonly")){var b,c,e,f=a.which||a.keyCode;o=B.val(),8===f||46===f||d&&127===f?(b=B.caret(),c=b.begin,e=b.end,e-c===0&&(c=46!==f?r(c):e=q(c-1),e=46===f?q(e):e),y(c,e),s(c,e-1),a.preventDefault()):13===f?v.call(this,a):27===f&&(B.val(E),B.caret(0,A()),a.preventDefault())}}function x(b){if(!B.prop("readonly")){var c,d,e,g=b.which||b.keyCode,i=B.caret();if(!(b.ctrlKey||b.altKey||b.metaKey||32>g)&&g&&13!==g){if(i.end-i.begin!==0&&(y(i.begin,i.end),s(i.begin,i.end-1)),c=q(i.begin-1),n>c&&(d=String.fromCharCode(g),j[c].test(d))){if(t(c),C[c]=d,z(),e=q(c),f){var k=function(){a.proxy(a.fn.caret,B,e)()};setTimeout(k,0)}else B.caret(e);i.begin<=m&&h()}b.preventDefault()}}}function y(a,b){var c;for(c=a;b>c&&n>c;c++)j[c]&&(C[c]=p(c))}function z(){B.val(C.join(""))}function A(a){var b,c,d,e=B.val(),f=-1;for(b=0,d=0;n>b;b++)if(j[b]){for(C[b]=p(b);d++<e.length;)if(c=e.charAt(d-1),j[b].test(c)){C[b]=c,f=b;break}if(d>e.length){y(b+1,n);break}}else C[b]===e.charAt(d)&&d++,k>b&&(f=b);return a?z():k>f+1?g.autoclear||C.join("")===D?(B.val()&&B.val(""),y(0,n)):z():(z(),B.val(B.val().substring(0,f+1))),k?b:l}var B=a(this),C=a.map(c.split(""),function(a,b){return"?"!=a?i[a]?p(b):a:void 0}),D=C.join(""),E=B.val();B.data(a.mask.dataName,function(){return a.map(C,function(a,b){return j[b]&&a!=p(b)?a:null}).join("")}),B.one("unmask",function(){B.off(".mask").removeData(a.mask.dataName)}).on("focus.mask",function(){if(!B.prop("readonly")){clearTimeout(b);var a;E=B.val(),a=A(),b=setTimeout(function(){B.get(0)===document.activeElement&&(z(),a==c.replace("?","").length?B.caret(0,a):B.caret(a))},10)}}).on("blur.mask",v).on("keydown.mask",w).on("keypress.mask",x).on("input.mask paste.mask",function(){B.prop("readonly")||setTimeout(function(){var a=A(!0);B.caret(a),h()},0)}),e&&f&&B.off("input.mask").on("input.mask",u),A()})}})});
