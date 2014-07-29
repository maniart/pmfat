var pmfat = (function(w, d, $, _) {

	var init,
		attachListeners,
		initAnchorScroll;

	initAnchorScroll = function() {
    	$('a[href*=#]:not([href=#])').click(function() {
		    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		      var hash = this.hash, 
		      	target = $(this.hash), 
		      	offset;
		      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		      offset = target.data('scroll-offset') ? target.data('scroll-offset') : 0; 
		      if (target.length) {
		        $('html,body').animate({
		          scrollTop: target.offset().top + offset
		        }, 300);
		        return false;
		      }
		    }
  		});
    };
	attachListeners = function() {
		var formData;
		$('#user-input').on('submit', function(event) {
			event.preventDefault();
			//console.log('form submtted');
			formData = $(this).serializeArray();
			$.ajax({
				type: "POST",
				url: "/api",
			  	data: formData
			})
			.success(function( data, textStatus, jqXHR ) {
				console.log("Success Received: " , data);
				if(typeof data.redirect === 'string') {
					window.location = data.redirect;
				}
			})
			.done(function( data, textStatus, jqXHR ) {
			    console.log( "Data Saved: " , data );
		  	});
		});
	};

	init = function() {
		attachListeners();
		initAnchorScroll();
		console.log('Made in Brooklyn.');
	};



	return {
		init : init
	};

}(window, document, jQuery, _));

jQuery(document).ready(pmfat.init);