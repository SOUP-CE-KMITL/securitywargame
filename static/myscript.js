$(document).ready(function(){
	console.log("ready!");
	
	$("#map-submit-button").click(function(){
		$("#create-map-form").submit();
	});
	
	$("#attacker-submit-button").click(function(){
		$("#create-attacker-form").submit();
	});
	
	$("#api-menu").click(function(){
		$("#content-api-documentation").hide();
		$("#content-api-detail").fadeIn('slow');
		$("#content-api-generate-key").fadeIn('slow');	
		
	});
	
	$("#dashboard-api").click(function(){
		$("#content-api").fadeIn('slow');
		$("#content-topology").hide();

	});
	
	$("#dashboard-topology").click(function(){
		$("#content-topology").fadeIn('slow');
		$("#content-api").hide();		
	});
	
	$("#docs-menu").click(function(){
		$("#content-api-documentation").fadeIn('slow');
		$("#content-api-detail").hide();
		$("#content-api-generate-key").hide();
		
	});

	$("[id^=group-control-button-plus]").click(function(){
		
		var className = $(this).attr('class');
		var target = $(this).attr('value');
		$("."+target).slideToggle('slow');
		
		if(className == 'general-spec-control-button-plus' ){
			$(this).addClass('general-spec-control-button-minus');
			$(this).removeClass('general-spec-control-button-plus');	
			$(this).html('<i class="fa fa-plus-circle"></i>');
		}  else {
			$(this).addClass('general-spec-control-button-plus');
			$(this).removeClass('general-spec-control-button-minus');	
			$(this).html('<i class="fa fa-minus-circle"></i>');			
		}

	});
	
	$("#submit-new-indoor-ap").click(function(){
		$("#add-new-indoor-ap-form").submit();
		console.log("hello world;");
	});
	
	jQuery.fn.center = function () {
			this.css("position","absolute");
			this.css("display","block");
			this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
			this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this; }
	
	
		

});