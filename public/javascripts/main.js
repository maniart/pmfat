var pmfat = (function(w, d, $, _) {

	var init,
		attachListeners;

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
			.done(function( msg ) {
			    console.log( "Data Saved: " + msg );
		  	});
		});
	};

	init = function() {
		attachListeners();
		console.log('Hello PMFAT');
	};



	return {
		init : init
	};

}(window, document, jQuery, _));

jQuery(document).ready(pmfat.init);