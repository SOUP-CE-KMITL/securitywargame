$(document).ready(function(){
	console.log("hello from dashboard");
	
	var page = $('#content-holder').attr('data-page');
	console.log(page);
	if (page==="home"){
		$("#dashboard-home").addClass("menu-selected");
	}
	if (page==="report"){
		$("#dashboard-report").addClass("menu-selected");
	}
		
	$("#admin-login-button").click(function(){
		$("#admin-login").submit();

	});

	$("#admin-regis-button").click(function(){
		$("#admin-regis").submit();

	});
});