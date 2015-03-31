
function PlayScene(){
	this.inited = false;
}


PlayScene.CAMP = {
	"name":"camp",
	"machineID":0,
	"captured": true,
	"service":{"serviceID":0, "name":"os", "machineID":0, "captured":true}
}

PlayScene.prototype.Init = function(){
	var preload = new createjs.LoadQueue();
	var plc = this.PreloadComplete;
  preload.on("fileload", this.PreloadComplete, this);
  preload.loadFile("resource/bg/bg-grass.png");
}

PlayScene.prototype.PreloadComplete = function(event){
	this.inited = true;
	this.scene = new createjs.Container();
	this.objLayer = new createjs.Container();
	this.guiLayer = new createjs.Container();
	this.scene.addChild(this.objLayer);
	this.scene.addChild(this.guiLayer);

	var shape = new createjs.Shape();
	shape.width = 1024;
	shape.height = 768;
	shape.graphics.bf(event.result).r(0,0,1024,768);
	this.objLayer.addChild(shape);

	var mountains = [];
	for(var i=0; i<4; i++){
		var imgNum = Math.floor(Math.random()*2+1);
		mountains[i] = new createjs.Bitmap("resource/bg/bg-mountain"+imgNum+".png");
		mountains[i].regX = 100;
		mountains[i].regY = 100;
		mountains[i].x = Math.random()*568+100;
		mountains[i].y = Math.random()*500+100;
		mountains[i].rotation = Math.random()*360;
		this.objLayer.addChild(mountains[i]);
	}


	this.inspecWin = new createjs.Container();
	this.guiLayer.addChild(this.inspecWin);
	var bg = new createjs.Bitmap("resource/UI/InspecWin.png")
	bg.y = 600;
	this.inspecWin.addChild(bg);
	this.baseView = new createjs.Container();
	this.guiLayer.addChild(this.baseView);
	this.baseView.bitmap = new createjs.Bitmap("resource/base.png");
	this.baseView.bitmap.x = 50;
	this.baseView.bitmap.y = 620;
	this.baseView.addChild(this.baseView.bitmap);
	this.baseView.stat = new createjs.Text("name: camp", "18px arial", "#FFFFFF");
	this.baseView.stat.x = 200;
	this.baseView.stat.y = 620;
	this.baseView.addChild(this.baseView.stat);
	this.inspecWin.addChild(this.baseView);

	this.inspecWin.stat = new createjs.Text("", "18px arial", "#FFFFFF");
	this.inspecWin.addChild(this.inspecWin.stat);
	this.inspecWin.stat.x = 400;
	this.inspecWin.stat.y = 620;

	this.topBar = new createjs.Bitmap("resource/UI/TopBar.png");
	this.topBar.x = 0;
	this.topBar.y = 0;
	this.guiLayer.addChild(this.topBar);


	this.comment = new createjs.Text("this is comment.", "18px arial", "#FFFFFF");
	this.guiLayer.addChild(this.comment);
	this.comment.x = 10;
	this.comment.y = 558;

	var detectSheet = new createjs.SpriteSheet({
		"images": ["resource/icon/icon-detect-guage.png"],
		"frames": {
			"width": 64,
			"height": 64,
			"regX": 32,
			"regY": 32,
			"count": 9
		}
	});
	this.detectIcon = new createjs.Sprite(detectSheet);
	this.detectIcon.x = 512;
	this.detectIcon.y = 32;
	this.guiLayer.addChild(this.detectIcon);
	this.detectIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Detection level."});

	this.turnIcon = new createjs.Bitmap("resource/icon/TimeIcon.png");
	this.guiLayer.addChild(this.turnIcon);
	this.turnIcon.x = 920;
	this.turnIcon.y = 10;
	this.turnIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Turn."});

	this.turnText = new createjs.Text("0", "18px arial", "#FFFFFF");
	this.guiLayer.addChild(this.turnText);
	this.turnText.x = 970;
	this.turnText.y = 15;

	this.cursor = new createjs.Bitmap("resource/target.png")
	this.guiLayer.addChild(this.cursor);
	this.cursor.x = -100;
	this.cursor.y = -100;
	this.cursor.regX = 32;
	this.cursor.regY = 32;
	createjs.Tween.get(this.cursor, {"loop":true})
		.to({"scaleX":1.2, "scaleY":1.2}, 500)
		.to({"scaleX":1, "scaleY":1}, 500);

	this.launch = new createjs.Bitmap("resource/UI/NextTurn.png")
	this.guiLayer.addChild(this.launch);
	this.launch.x = 980;
	this.launch.y = 620;
	this.launch.addEventListener("click", PlayScene.Launch);
	this.launch.addEventListener("mouseover", function(){PlayScene.comment.text = "Next step."})

	/*
	this.moneyText = new createjs.Text("10", "18px arial", "#FFFFFF");
	//this.guiLayer.addChild(this.moneyText);
	this.moneyText.x = 10;
	this.moneyText.y = 10;
	*/

	ActionPane.Init(this.inspecWin);
	QueueList.Init(this.guiLayer);

	this.activeLevel = 0;
	this.activeLevelText = new createjs.Text("0", "18px arial", "#FFF");
	this.guiLayer.addChild(this.activeLevelText);
	this.activeLevelText.x = 512;
	this.activeLevelText.y = 18;
	this.activeLevelText.textAlign = "center";

	this.moneyIcon = new createjs.Bitmap("resource/icon/MoneyIcon.png")
	this.guiLayer.addChild(this.moneyIcon);
	this.moneyIcon.x = 10;
	this.moneyIcon.y = 10;
	this.moneyIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Score."});

	this.score = 0;
	this.scoreText = new createjs.Text("0", "18px arial", "#FFF");
	this.guiLayer.addChild(this.scoreText);
	this.scoreText.x = 60;
	this.scoreText.y = 15;

	this.helpScr = new createjs.Bitmap("resource/bg/Help.png");
	this.guiLayer.addChild(this.helpScr);
	this.helpScr.visible = false;

	this.helpBtn = new createjs.Bitmap("resource/icon/Icon-help.png");
	this.guiLayer.addChild(this.helpBtn)
	this.helpBtn.x = 1000;
	this.helpBtn.y = 100;
	this.helpBtn.regX = 32;
	this.helpBtn.regY = 32;
	this.helpBtn.on("click", function(e){
		this.helpScr.visible = ! this.helpScr.visible;
	}, this);
	this.helpBtn.on("mouseover", function(e){
		createjs.Tween.get(this.helpBtn)
			.to({"scaleX":1.1, "scaleY":1.1}, 200);
	}, this)
	this.helpBtn.on("mouseout", function(e){
		createjs.Tween.get(this.helpBtn)
			.to({"scaleX":1, "scaleY":1}, 200);
	}, this)

	
	PlayScene.objLayer = this.objLayer;
	PlayScene.guiLayer = this.guiLayer;
	PlayScene.cityMap = null;
	PlayScene.inspecWin = this.inspecWin;
	PlayScene.baseView = this.baseView;
	PlayScene.turnText = this.turnText;
	PlayScene.cursor = this.cursor;
	PlayScene.base = PlayScene.CAMP;
	PlayScene.moneyText = this.moneyText;
	PlayScene.queueList = this.queueList;
	PlayScene.atkQueue = [];
	PlayScene.currentCity = null;
	PlayScene.comment = this.comment;
	PlayScene.activeLevelText = this.activeLevelText;
	PlayScene.activeLevel = 0;
	PlayScene.score = this.score;
	PlayScene.scoreText = this.scoreText;
	PlayScene.detectIcon = this.detectIcon;

	this.baseView.bitmap.on("click", function(e){
		endGame("retire")
	}, this)
	this.Show(SceneManager.stage, SceneManager.params);
	SceneManager.currentScene = this;
}

PlayScene.prototype.Show = function(stage, params){

	SceneManager.currentScene = this
	stage.addChild(this.scene);
	PlayScene.turnText.text = "0"
	
	//play bgm
	Jukebox.play("play-bgm", -1)

	var req;
	if (window.XMLHttpRequest){
	  req=new XMLHttpRequest();
	}else{
	  req=new ActiveXObject("Microsoft.XMLHTTP");
	}

	req.open("POST","/create-waypoint",false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send("mapID="+SceneManager.params+"&playerID="+getCookie("user_id"));
	var retObj = JSON.parse(req.responseText)
	PlayScene.wayKey = retObj.waypointsID
	PlayScene.replayStep = retObj.step
	PlayScene.score = retObj.score
	PlayScene.scoreText.text = PlayScene.score;
	PlayScene.turnText.text  = retObj.savedTurn

	var p=PlayScene
	var jGraph = JSON.parse(retObj.graphStat)
	p.mapDrawer = new MapDrawer(jGraph);
	PlayScene.graph = jGraph;
	console.log(jGraph);

	var cities = p.mapDrawer.DrawWorldMap(p.objLayer);
	for(var i=0; i<cities.length; i++){
		cities[i].sprite.addEventListener("click", City.ClickHandler);
		cities[i].sprite.addEventListener("mouseover", City.ShowCityInfo);
	}
}

PlayScene.Launch = function(e){

	var p = PlayScene;
	p.turnText.text = parseInt(p.turnText.text, 10)+1;

	if(p.atkQueue.length == 0){
		PlayScene.activeLevel -= 1;
	}

	if(p.activeLevel>=8){
		endGame("detected")
		return
	}
	/*for (var i=0; i<p.atkQueue.length; i++){		
		var s = p.atkQueue[i].soldier;
		if(s.name=="Picklocker"){
			PlayScene.activeLevel +=2;
		}else{
			PlayScene.activeLevel += 1;
		}
	}*/

	for (var i=0; i<p.atkQueue.length; i++){
		//reach final turn -> do mission.
		if (p.atkQueue[i].start + p.atkQueue[i].dur == parseInt(p.turnText.text, 10)){
			addStep(p.atkQueue[i]);
			var sol = p.atkQueue[i].soldier;
			var score = 0
			if(sol.name=="explorer"){
				PlayScene.activeLevel += 1;
				var dstMachine=sol.city.machine;
				dstMachine.status="ready";
				sol.city.sprite.gotoAndPlay("level"+ (Math.ceil(sol.city.services.length/2)));
				sol.Erase();
				score = 5
				sol.city.DrawLink()
			}else if(sol.name=="occupier" || sol.name=="occupy"){
				/*deprecated -- occupy automaticly after attacked*/
			}else if(sol.name=="Picklocker"){
				PlayScene.activeLevel += 3;
				var r = Math.random();
				if (r < 0.5){
					sol.forPath.keyHeld += 1;
					PlayScene.comment.text = "Picklocking success.";
					score = 10
				}else{
					PlayScene.comment.text = "Picklocking fails.";
				}
			}else if(sol.name=="Locksmith"){
				PlayScene.activeLevel += 1;
				var r = Math.random();
				if (r < 0.9){
					sol.forPath.keyHeld += 1;
					PlayScene.comment.text = "Key coppied.";
					score = 10
				}else{
					PlayScene.comment.text = "Can't coppy the key.";
				}
			}else{ //attacker
				var dstService = getServiceById(sol.edge.dest);
				var dstMachine = getMachineById(dstService.machineID);
				
				//Set status
				dstMachine.status = "ready";
				sol.edge.status = "used";

				//play sound
				Jukebox.play("success-sfx")
				//Occupy
				PlayScene.activeLevel += 1;
				console.log(sol)
				if(sol.integrity==1){
					var service = getServiceById(sol.edge.dest);
					score += Building.Capture(service, sol)
				}else if(sol.integrity==2){
					var c = getCityById(sol.to);
					for(var  j=0; j<c.services.length; j++){
						var service = getServiceById(c.services[j].serviceID)
						score += Building.Capture(service, sol)
					}
					c.Spread();
					c.DrawLink();
				}

				

				score+= SCORE_SYSTEM.av[sol.vector];
				score+= SCORE_SYSTEM.ac[sol.level];
				score+= SCORE_SYSTEM.au[sol.authen];
			}

			//update score and graph status
			if(score > 0 ){
				PlayScene.score += score;
				PlayScene.scoreText.text = PlayScene.score;
				var req2;
				if (window.XMLHttpRequest){
				  req2=new XMLHttpRequest();
				}else{
				  req2=new ActiveXObject("Microsoft.XMLHTTP");
				}

				req2.open("POST","/update-score",false);
				req2.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				req2.send(
					"waypoint="+PlayScene.wayKey+
					"&score="+PlayScene.score+
					"&graphStat="+JSON.stringify(PlayScene.graph)+
					"&currentTurn="+PlayScene.turnText.text
				)
			}

			if(PlayScene.cityMap){
				//erase character
				createjs.Tween.get(sol.sprite, {"override":true})
					.to({"scaleX":0, "scaleY":0}, 300)
					.call(function(e){
						PlayScene.cityMap.removeChild(sol.sprite);
					})
			}

			//play fx
			if(sol.sprite){
				EffectMaster.Explode(PlayScene.objLayer, sol.sprite.x, sol.sprite.y)
			}else{
				EffectMaster.Explode(PlayScene.objLayer)
			}

			//dequeue
			p.atkQueue.splice(i,1);
			i--;
		}
	}

	if (PlayScene.activeLevel > 8) PlayScene.activeLevel=8;
	if (PlayScene.activeLevel <= 0) PlayScene.activeLevel=0;
	PlayScene.activeLevelText.text = PlayScene.activeLevel;
	PlayScene.detectIcon.gotoAndStop(PlayScene.activeLevel);

	for(var i=0; i<QueueList.names.length; i++){
		QueueList.remTurns[i].text = QueueList.remTurns[i].text - 1;
	}
	QueueList.Remove();
}

function occupy(sol){
	var dest;
	if(sol.integrity<2){
		dest = sol.edge.dest;
	}else{
		dest = 0;
	}

	var atkObj = {
		"start": parseInt(PlayScene.turnText.text, 10),
		"soldier": {
			name:"occupier",
			city: dest,
			level: 1,
			op: "Install root kit",
			from: PlayScene.base && PlayScene.base.machineID || 0,
			to: getServiceById(sol.edge.dest).machineID,
		},
		"dur": 5,
		"ci": 0,
		"ii": 0,
		"ai": 0,
		"score": 10,
		"cve_id": 0
	};
	QueueList.Add(atkObj.soldier.name, atkObj.dur);
	PlayScene.atkQueue.push(atkObj);
	addStep(atkObj);
}

function getServiceById(id){
	if(id==0){
		return PlayScene.CAMP.service;
	}
	for(var i=0; i<PlayScene.graph.services.length; i++){
		if(PlayScene.graph.services[i].serviceID==id){
			return PlayScene.graph.services[i];
		}
	}
	return null;
}

function getMachineById(id){
	for(var i=0; i<PlayScene.graph.machines.length; i++){
		if(PlayScene.graph.machines[i].machineID==id){
			return PlayScene.graph.machines[i];
		}
	}
	return null;
}

function getPathById(id){
	for(var i=0; i<PlayScene.graph.paths.length; i++){
		if(PlayScene.graph.paths[i].pathID==id){
			return PlayScene.graph.paths[i];
		}
	}
	return null;
}

function getCityById(id){
	for(var i=0; i<PlayScene.cities.length; i++){
		if(PlayScene.cities[i].cityID==id){
			return PlayScene.cities[i];
		}
	}
	return null;
}

function getBuildingById(id){
	for(var i=0; i<PlayScene.buildings.length; i++){
		if(PlayScene.buildings[i].buildingID==id){
			return PlayScene.buildings[i];
		}
	}
	return null;
}

function endGame(reason){
	SceneManager.ChangeScene("end")
	var p = PlayScene
	var req;
	if (window.XMLHttpRequest){
	  req=new XMLHttpRequest();
	}else{
	  req=new ActiveXObject("Microsoft.XMLHTTP");
	}
	req.open("POST","/end-game?wpid="+p.wayKey+"&score="+p.score+"&turn="+p.turnText.text+"&reason="+reason,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send();
}
PlayScene.prototype.Hide=function(stage){
	stage.removeChild(this.scene);
}