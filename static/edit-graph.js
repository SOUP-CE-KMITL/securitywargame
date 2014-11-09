var main = function(){
	console.log("hello from add graph");
	
	$('.add-machine-header-button').click(function(){
		$('.add-machine-form').toggle();
	});
	
	$('.add-new-machine-button').click(function(){
		$('#addNewMachineForm').submit();
	});

	$('.add-service-header-button').click(function(){
		$('.add-service-form').toggle();
	});

	
	$('.add-new-service-button').click(function(){
		$('#addNewServiceForm').submit();
	});
	
	$('.add-path-header-button').click(function(){
		$('.add-path-form').toggle();
	});
	
	$('.add-new-path-button').click(function(){
		$('#addNewPathForm').submit();
	});
	
	var request;
	$('#addNewMachineForm').submit(function(event){
		if (request) {
			request.abort();
		}
		
		var $form = $(this);
		var target_url = $('#target_url').val()
		var $inputs = $form.find("input, select, button, textarea");
		url = $form.attr("action");
		
		var serialized_data = $form.serialize();
		$inputs.prop("disabled", true);
		
		request = $.ajax({
			url: url,
			type: "post",
			data: serialized_data
		
		});
		
		request.done(function (response, textStatus, jqXHR){

			alert( "Add new Machine" );
			$( "#edit-graph-preview" ).load( target_url+" #edit-graph-preview", function( html ) {
				//
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
	
	var request2;	
	$('#addNewServiceForm').submit(function(event){
		if (request2) {
			request2.abort();
		}
		
		var $form = $(this);
		var target_url = $('#target_url').val()
		var $inputs = $form.find("input, select, button, textarea");
		url = $form.attr("action");
		
		var serialized_data = $form.serialize();
		$inputs.prop("disabled", true);
		
		request2 = $.ajax({
			url: url,
			type: "post",
			data: serialized_data
		});
		
		request2.done(function (response, textStatus, jqXHR){

			alert( "Add new Service" );
			$( "#edit-graph-preview" ).load( target_url+" #edit-graph-preview", function( html ) {
				//do nothing
			});
		
		});
		
		request2.fail(function (response, textStatus, jqXHR){
			//$('#FailBox').center();
			//$('#FailBox').show();
		});
		
		request2.always(function () {
			// re-enable the inputs
			$inputs.prop("disabled", false);
		});
		
		event.preventDefault();
	});
	
	var request3;	
	$('#addNewPathForm').submit(function(event){
		if (request3) {
			request3.abort();
		}
		
		var $form = $(this);
		var target_url = $('#target_url').val()
		var $inputs = $form.find("input, select, button, textarea");
		url = $form.attr("action");
		
		var serialized_data = $form.serialize();
		$inputs.prop("disabled", true);
		
		request3 = $.ajax({
			url: url,
			type: "post",
			data: serialized_data
		});
		
		request3.done(function (response, textStatus, jqXHR){

			alert( "Add new Path" );
			$( "#edit-graph-preview" ).load( target_url+" #edit-graph-preview", function( html ) {
				//do nothing
			});
		
		});
		
		request3.fail(function (response, textStatus, jqXHR){
			//$('#FailBox').center();
			//$('#FailBox').show();
		});
		
		request3.always(function () {
			// re-enable the inputs
			$inputs.prop("disabled", false);
		});
		
		event.preventDefault();
	});	
}

$(document).ready(main);