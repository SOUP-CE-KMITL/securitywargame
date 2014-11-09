var main = function(){	
	console.log("Create Graph Ready!");
	
	$('[id^=deleteGraphButton]').click(function(){
		var target_form = $(this).attr('value');
		$('#'+target_form).submit();
	});
	
	
	$('#submitNewGraph').click(function(){
		$('#createGraphForm').submit();		
	});
	

	
	var request;
	$('#createGraphForm').submit(function(event){
			if (request) {
				request.abort();
			}
			
			var $form = $(this);
			var $inputs = $form.find("input, select, button, textarea");
			url = $form.attr( "action" );
			
			var serialized_data = $form.serialize();
			$inputs.prop("disabled", true);
			
			request = $.ajax({
				url: url,
				type: "post",
				data: serialized_data
			});
			
			request.done(function (response, textStatus, jqXHR){

				alert( "Add new graph" );
				$( ".graph-details-box" ).load( "/create-graph .graph-details-box", function( html ) {
					//do nothing
				});
			});
			
			request.fail(function (response, textStatus, jqXHR){
				//$('#FailBox').center();
				//$('#FailBox').show();
			});
			
			request.always(function () {
				// re-enable the inputs
				$inputs.prop("disabled", false);
			});
			
			event.preventDefault();
		});
		

}


$(document).ready(main);