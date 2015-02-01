$(document).ready(function(){
	console.log("hello from dashboard");
	jQuery.fn.center = function () {
			this.css("position","absolute");
			this.css("display","block");
			this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
			this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this; }
	
	var page = $("#dashboard-xxx").attr("data-page");
	console.log(page);
	if (page==="home"){
		$("#dashboard-home").addClass("menu-selected");
	}
	if (page==="report"){
		$("#dashboard-report").addClass("menu-selected");
	}
	if (page==="api"){
		$("#dashboard-api").addClass("menu-selected");
	}
		
	$("#admin-login-button").click(function(){
		$("#admin-login").submit();

	});

	$("#admin-regis-button").click(function(){
		$("#admin-regis").submit();

	});

	$("#add-graph-submit").click(function(){
		$("#add-new-graph-form").submit();
		//console.log("add new graph");

	});

	$("#doc").click(function(){
		$().fadeIn();

	});

	$('#myModal').on('shown.bs.modal', function () {
    	$('#myInput').focus()
  	})

	var request;
	$('#add-new-graph-form').submit(function(event){
		if (request) {
			request.abort();
		}
		

		var $form = $(this);
		//var target_url = $('#target_url').val()
		var $inputs = $form.find("input, select, button, textarea");
		url = $form.attr("action");
		
		var serialized_data = $form.serialize();
		$inputs.prop("disabled", true);
		
		request = $.ajax({
			url: url,
			type: "post",
			data: serialized_data,
			beforeSend: function(){
				//$(".loading-img").addClass('centered');
				$(".loading-img").center();
				$(".loading-img").show();				
			}
		
		});
		
		request.done(function (response, textStatus, jqXHR){
			$(".loading-img").hide();
			var successMessage = $('<div class="alert alert-success" role="alert">Successful add new graph!</div>');
			successMessage.appendTo("#add-graph-modal");

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
	
});