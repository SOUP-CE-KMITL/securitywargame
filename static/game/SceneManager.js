
SceneManager = {};

SceneManager.SetUp=function(stage){
	this.scenes={
		"home": new HomeScene(),
		"play": new PlayScene(),
		"level": new LevelScene(),
		"end": new EndScene()
	};
	this.currentScene = null;
	this.stage = stage;
}

SceneManager.ChangeScene=function(dest, effect, dur){
	var newScene = this.scenes[dest];
	
	if(newScene.inited == false) 
		newScene.Init();

	if(effect==null){
		if(this.currentScene!=null){
			this.currentScene.Hide(this.stage);
		}
	}
}

function HomeScene(){}

function LevelScene(){
	this.inited=false;
}

LevelScene.prototype.Init=function(){
	this.inited=true;
	this.scene = new createjs.Container();
	this.Show(SceneManager.stage);
}
LevelScene.prototype.Show=function(stage){

	function onLevelSelected(e){
		SceneManager.params=e.target.urlsafekey;
		SceneManager.ChangeScene("play")
	}
	stage.addChild(this.scene);

	var xmlhttp;
	if (window.XMLHttpRequest){
	  xmlhttp=new XMLHttpRequest();
	}else{
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("POST","/maplist",false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("player=john");
	var maplist = JSON.parse(xmlhttp.responseText);

	for(var i=0; i<maplist.length; i++){
		var btn = new createjs.Text(maplist[i], "18px arial", "#000000");
		btn.urlsafekey = maplist[i];
		btn.y = i*30
		btn.addEventListener("click", onLevelSelected);
		this.scene.addChild(btn);
	}
}
LevelScene.prototype.Hide=function(stage){
	stage.removeChild(this.scene);
}

function EndScene(){}