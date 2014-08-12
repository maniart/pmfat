var pmfat = (function(w, d, $, _) {

	var init,
		attachListeners,
		initAnchorScroll,
		initSnapScroll,
		sanitizeFormData,
		modals,
		isFormComplete,
		populateConfirmModal;

	modals = {};

	sanitizeFormData = function(serializedFormData) {
		
		if(!serializedFormData instanceof Array) {
			throw new Error('Serialized Form Data needs to be an array.');
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
		      		offset;
		      		target = $('[name=' + this.hash.slice(1) +']');
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
    
    initSnapScroll = function() {

    	$('body').panelSnap({
			panelSelector: '.container',
			namespace: '.panelSnap',
			directionThreshold: 30,
			slideSpeed: 200,
			keyboardNavigation: {
				enabled: true,
				nextPanelKey: 40,
				previousPanelKey: 38,
				wrapAround: true
			}
		});	
   
    };


    isFormComplete = function() {
    	
    	var nullFound = false;
    	$('input', '#user-input').each(function(idx, el) {
    		if($(el).val().length === 0) {
    			return nullFound = true;
    		}
    		
    		
    	});
    	return nullFound === true ? false : true;
    	
    };

    populateConfirmModal = function(callback) {
    
    	var name,
    		title;

    	name = $.trim($('#user-last-name').val());
    	title = $.trim($('#adjective').val()) + '-' + $.trim($('#object-of-critique').val());

    	$('.confirm-message .name .content').text(name);
    	$('.confirm-message .theory-title .content').text('Preliminary Materials for a Theory of the ' + title);

    	if(callback && typeof callback === 'function') {
    		callback();
    	}
    };

	attachListeners = function() {
		
		// focus on the form as soon as user scrolls down
		$('.generate-text').on('click', function(ev){
			$('#user-input input').eq(0).focus();
		});

		var formData = {};

		$('#user-input .submit-btn').on('click', function(event) {

			event.preventDefault();
			
			if(isFormComplete()) {
				
				formData = sanitizeFormData($('#user-input').serializeArray()); // trim whitespace
				
				populateConfirmModal(function() {
					modals.confirm.modal('show')
					.one('click', '#generate', function() {
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
					  	

					  	console.log('Submission Confirmed');	
					});	
				});			

				

			} else {
				modals.incomplete.modal('show');
			}

			
		});

	};

	init = function() {
		
		modals.incomplete = $('#form-incomplete').modal({
			show : false,
			keyboard : true,
		});

		modals.confirm = $('#confirm-modal').modal({
			show : false,
			keyboard : true,
			backdrop: 'static'
		});
		
		modals.processing = $('#wait-modal').modal({
			show : false,
			keyboard : false,
			backdrop: 'static'
		});

		attachListeners();
		initAnchorScroll();
		initSnapScroll();
		
		console.log('Made in Industry City - \nLovely Sunset Park, Brooklyn.');
	
	};



	return {
		init : init,
		modals : modals
	};

}(window, document, jQuery, _));

jQuery(document).ready(pmfat.init);