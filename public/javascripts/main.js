var pmfat = (function(w, d, $, _) {

	var init,
		attachListeners,
		initAnchorScroll,
		sanitizeFormData,
		modal;

	sanitizeFormData = function(serializedFormData) {
		if(!serializedFormData instanceof Array) {
			throw new Error('Serialized Form Data needs to be an array');
		}
		_.each(serializedFormData, function(input) {
			input.value = $.trim(input.value);
		});
		return serializedFormData;
	};

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
			
			formData = sanitizeFormData($(this).serializeArray()); // trim whitespace
			modal.modal('show'); // show modal while PDF is being generated
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
		modal = $('#waitModal').modal({
			show : false,
			keyboard : false,
			backdrop: 'static'
		});
		attachListeners();
		initAnchorScroll();
		console.log('Made in Industry City, Sunset Park, Brooklyn.');
	};



	return {
		init : init
	};

}(window, document, jQuery, _));

jQuery(document).ready(pmfat.init);