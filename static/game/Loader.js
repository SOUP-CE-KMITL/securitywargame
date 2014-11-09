
function XMLLoader(keystring, playScene){
	var xmlhttp;
	if (window.XMLHttpRequest){
	  xmlhttp=new XMLHttpRequest();
	}else{
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("POST","http://localhost:12080/loader",true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("keystring="+keystring+"&player=john");
	
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			playScene.OnLoadComplete(JSON.parse(xmlhttp.responseText), playScene);
		}
	}
}
