
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
	
	stage.addChild(this.scene);
	//SceneManager.currentScene = this;
	var xmlhttp;
	if (window.XMLHttpRequest){
	  xmlhttp=new XMLHttpRequest();
	}else{
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("GET","/maplist?player=john",false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send();
	var maplist = JSON.parse(xmlhttp.responseText);

	var headline = new createjs.Text("MAP SELECT", "36px arial", "#FFF");
	headline.textAlign = "center";
	headline.x = 512;
	this.scene.addChild(headline);
	var btn = [];

	for(var i=0; i<maplist.length; i++){
		btn[i] = new createjs.Container();
		btn[i].bbg = new createjs.Shape();
		btn[i].bbg.graphics.clear().s('#6DEAFF').f("#008CA4").r(-500,-15,1000,30).ef().es();
		btn[i].addChild(btn[i].bbg);
		var label = new createjs.Text(maplist[i].name, "18px arial", "#FFF");
		btn[i].urlsafekey = maplist[i].key;
		label.textAlign = "center";
		label.y = -10
		btn[i].addChild(label);
		btn[i].x = 512;
		btn[i].y = 60+i*40;
		btn[i].on("click", function(){
			SceneManager.params= this.urlsafekey;
			SceneManager.ChangeScene("play")
		}, btn[i]);
		btn[i].on("mouseover", function(){
			this.bbg.graphics.clear().s('#6DEAFF').f("#C8F8FF").r(-500,-15,1000,30).ef().es();
		}, btn[i]);
		btn[i].on("mouseout", function(){
			this.bbg.graphics.clear().s("#6DEAFF").f("#008CA4").r(-500,-15,1000,30).ef().es();
		}, btn[i])
		this.scene.addChild(btn[i]);
	}
}
LevelScene.prototype.Hide=function(stage){
	stage.removeChild(this.scene);
}

function EndScene(){}