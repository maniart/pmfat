var pmfat = (function(w, d, $, _) {

	var init,
		attachListeners,
		initAnchorScroll,
		initSnapScroll,
		sanitizeFormData,
		modals,
		isFormComplete,
		populateConfirmModal,
		capitalizeFirstLetter,
		initShareButton,
		initShareButton,
		initPdfViewer,
		checkHash;

	modals = {};

	var $body = $('body');
    	var currentPageTitle = $body.data('pagetitle');

	sanitizeFormData = function(serializedFormData) {
		
		if(!serializedFormData instanceof Array) {
			throw new TypeError('Serialized Form Data needs to be an array.');
			return;
		}
		
		_.each(serializedFormData, function(input) {
			input.value = $.trim(input.value);

			if(!(input.name === 'protagonistPronoun' || input.name === 'antagonistPronoun')) {
				try {
					input.value = capitalizeFirstLetter(input.value);
				} catch(e) {
					console.log(e);
				}

			}
			console.log(input);
		});
		
		return serializedFormData;
	
	};

	checkHash = function() {

		var hashFileName,
			isFileInArchive;

		if(w.location.hash.length === 0) { return; }

		hashFileName = w.location.hash.slice(1);
		isFileInArchive = false;

		$('[data-pdffilename]').each(function(idx, el) {
			if($(el).data('pdffilename') === hashFileName) {
				return isFileInArchive = true;
			}
			
		});

		if(isFileInArchive) {
			initPdfViewer(hashFileName);
		} else {
			modals.fileNotFound.modal('show');
		}
		

	};

	capitalizeFirstLetter = function(string) {
    	
    	if(typeof string !== 'string') {
    		throw new TypeError('Input should be a string');
    		return;
    	}

    	return string.charAt(0).toUpperCase() + string.slice(1);
	}

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
    
    initShareButton = function() {
    	
    	var $body,
    		currentPageTitle,
    		config,
    		shareButton;

    	$body = $('body');
    	currentPageTitle = $body.data('pagetitle');

		if(currentPageTitle !== 'archive') { return; }

		config = {
			ui : {
				flyout : 'bottom left',
				button_text : ''
			},
			networks : {
				email : {
					enabled : true,
					before: function(element) {
						console.log(element);
					}
				
				},
				google_plus : {
					enabled : true
				},
				facebook : {
					enabled : true
				},
				twitter : {
					enabled : true
				},
				
				pinterest : {
					enabled : true // turning this off via CSS. Hacky, but oh well.
				}

			}
		};

		shareButton = new Share('.share', config);
		

    };

    initSnapScroll = function(pageTitles) {

    	if(!pageTitles instanceof Array) {
    		throw new TypeError('pageTitles needs to be an array');
    		return;
    	}
    	
    	var	$body,
    		currentPageTitle;

    	$body = $('body');
    	currentPageTitle = $body.data('pagetitle');
    	
    	if(undefined === currentPageTitle) { return ; }

    	if(pageTitles.indexOf(currentPageTitle) > -1) {
    		$body.panelSnap({
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
    	}
    	
    };


    isFormComplete = function() {
    	
    	var nullFound = false;
    	$('input', '#user-input').each(function(idx, el) {
    		if($(el).val().length === 0) {
    			return nullFound = true;
    		}
    		
    		
    	});
    	return !nullFound;
    	
    };

    populateConfirmModal = function(callback) {
    
    	var name,
    		title;

    	name = capitalizeFirstLetter($.trim($('#user-last-name').val()));
    	title = capitalizeFirstLetter($.trim($('#adjective').val())) 
				+ '-' 
				+ capitalizeFirstLetter($.trim($('#object-of-critique').val()));

    	$('.confirm-message .name .content').text(name);
    	$('.confirm-message .theory-title .content').text('Preliminary Materials for a Theory of the ' + title);

    	if(callback && typeof callback === 'function') {
    		callback();
    	}
    };

    initPdfViewer = function(pdffilename) {


    	var	$body,
    		currentPageTitle,
    		iframe,
    		pdfPath;

    	$body = $('body');
    	currentPageTitle = $body.data('pagetitle');

    	if(currentPageTitle !== 'archive') {
    		return;
    	}

    	pdfPath = '../../' + pdffilename;
    	iframe = d.querySelector('#pdf-viewer');
    	iframe.src = 'http://preliminarymaterialsforanytheory.com/pdf/pdfjs/web/viewer.html?file=' 
					+ pdfPath 
					+ '#page=1&zoom=1'; 
					// Reset page number and zoom

    	modals.pdfViewer.modal('show');
    	
    };

	attachListeners = function() {
		
		//focus on the form as soon as user scrolls down
		$('.generate-text').on('click', function(ev){
			w.setTimeout(function() {
				$('#user-input input').eq(0).focus();
			}, 250)
		});

		
		// Reset pdf viewer src
		$('#pdf-viewer-wrapper').on('hidden.bs.modal', function() { 
			d.querySelector('#pdf-viewer').src = '';
		});

		$('.view-pdf').on('click', function(event) {

			event.preventDefault();
			initPdfViewer($(this).data('pdffilename'));

		});

		var formData = {};

		$('#user-input .submit-btn').on('click', function(event) {

			event.preventDefault();
			
			if(isFormComplete()) {
				
				try {
					formData = sanitizeFormData($('#user-input').serializeArray()); // trim whitespace
				} catch(e) {
					console.log(e);
				}

				populateConfirmModal(function() {
					modals.confirm.modal('show')
					.one('click', '#generate', function() {
						$.ajax({
							type: "POST",
							url: "/api",
						  	data: formData,
						  	beforeSend: function() {
						  		modals.confirm.modal('hide');
						  		modals.processing.modal('show');
						  		console.log('>> main.js : beforeSend');
						  	}
						})
						.success(function( data, textStatus, jqXHR ) {
							console.log("Success Received: " , data);
							if(typeof data.redirect === 'string') {	
								window.location = data.redirect;
							} 
						})
						.done(function( data, textStatus, jqXHR ) {
						    console.log('Submission Confirmed');
						    console.log( "Data Saved: " , data );
					  	});
					  		
					});	
				});			

			} else {
				modals.incomplete.modal('show');
			}

			
		});

	};

	init = function() {
		
		// point to the PDFJS worker, to be loaded async
		w.PDFJS.workerSrc = '/javascripts/thirdparty/pdf.worker.js';

		// dev
		if(w.location.hash === '#dev') {
			$('.under-construction').fadeOut(300);
		}

		modals.pdfViewer = $('#pdf-viewer-wrapper').modal({
			show : false
		});

		modals.fileNotFound = $('#file-not-found').modal({
			show : false,
			keyboard: true
		});

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

		checkHash();
		
		attachListeners();
		
		initAnchorScroll();
		
		initSnapScroll( ['index'] );
		
		initShareButton();		
				
		console.log('Made in Industry City - \nLovely Sunset Park, Brooklyn.');
	
	};



	return {

		init : init
	
	};

}(window, document, jQuery, _));

jQuery(document).ready(pmfat.init);