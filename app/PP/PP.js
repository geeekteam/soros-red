
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));


$(document).ready(function(){
	$('head').append('\
		<style>\
		#wraaap {\
			width: 100%;\
			height: 100%;\
			position: relative;\
		}\
\
		#wrap_scrin, #wrap_verstka {\
			width: 100%;\
			min-height: 100%;\
			position: absolute;\
			top: 0;\
			left: 0;\
		}\
\
		#pixel_perfect_buttons {\
			position: fixed;\
			top: 0;\
			left: 0;\
			width: 150px;\
			height: 24px;\
			clear: both;\
			z-index: 10000;\
			font: 14px Tahoma, sans-serif;\
			color: #333;\
		}\
\
		#pixel_perfect_buttons > div {\
			height: 22px;\
			float: left;\
			cursor: pointer;\
			margin-right: 3px;\
			border: 1px solid #333;\
			background-color: #fff;\
		}\
		</style>\
	');

	$('body > *').wrapAll('<div id="wraaap"><div id="wrap_verstka"></div></div>');

	$('#wraaap').prepend('<div id="pixel_perfect_buttons">\
		<div id="pixel_perfect_button_1">off</div>\
		<div id="pixel_perfect_button_2">50%x50%</div>\
		<div id="pixel_perfect_button_3">on</div>\
		<div id="chose_img">img</div>\
		<div id="the_img_field" style="display:none;"><input style="width:100px; border:none;background:none;" placeholder="enter img name" type="text"/></div>\
	</div>\
	<div id="wrap_scrin" style="background: url(PP/shab.jpg) no-repeat center top">\
		<div style="margin: 0 auto; text-align:center;">\
			<img src="PP/shab.jpg" alt="" style="opacity:0" />\
		</div>\
	</div>');

	var c_img = $.cookie('cookie_img');

	if(c_img != '') {
		$('#wrap_scrin img').attr('src', c_img);
		$('#wrap_scrin').css({'background-image': 'url('+c_img+')'})
		console.log(c_img)
	}

	$('#the_img_field input').bind('keypress', function(e) {
		if(e.keyCode==13){
			var img = 'PP/'+$(this).val();
			$('#wrap_scrin img').attr('src', img);
			$('#wrap_scrin').css({'background-image': 'url('+img+')'})

			$.cookie('cookie_img', img);
		}
	});

	var cons = $.cookie('consistent');
	// console.log(cons)

	if(cons == 'on') {
		$('#wrap_scrin').css('opacity', '1');
		$('#wrap_verstka').css('opacity', '0');
	} else if(cons == "half") {
		$('#wrap_scrin').css('opacity', '0.5');
		$('#wrap_verstka').css('opacity', '0.5');
	} else if(cons == "off") {
		$('#wrap_scrin').css('opacity', '0');
		$('#wrap_verstka').css('opacity', '1');
	} else {
		$('#wrap_scrin').css('opacity', '0');
		$('#wrap_verstka').css('opacity', '1');
		console.log('hi')
	}

 $('#chose_img').on('click', function(){
	$('#the_img_field').toggle();
 })
  $('#pixel_perfect_button_1').on('click', function(eventObject){
	$('#wrap_scrin').css('opacity', '0');
	$('#wrap_verstka').css('opacity', '1');
	$.cookie('consistent', "off");
	console.log('off')
  });
  $('#pixel_perfect_button_2').on('click', function(eventObject){
	$('#wrap_scrin').css('opacity', '0.5');
	$('#wrap_verstka').css('opacity', '0.5');
	$.cookie('consistent', "half");
	console.log('half')
  });
  $('#pixel_perfect_button_3').on('click', function(eventObject){
	$('#wrap_scrin').css('opacity', '1');
	$('#wrap_verstka').css('opacity', '0');
	$.cookie('consistent', "on");
	console.log('on')
  });
});