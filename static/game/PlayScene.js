/* global createjs */
var PlayScene = {
	scene: null,
	worldMap: null,
	cityMap: null,
	graph: null,
	wayKey: null,
	comment: null,
	detectIcon: null,
	turnText: null,
	cursor: null,
	activeLevel: 0,
	activeLevelText: null,
	score: 0,
	scoreText: null,
	atkQueue: [],
	stat: null,
	mapID: 0,
	
	load: function(params){
		//create waypoint
		var waypoint = JSON.parse(callAPI("POST", "/create-waypoint", "mapID="+params.mapID+"&playerID="+ (getCookie("user_id") || "anonymous")))
		this.graph = new Graph(JSON.parse(waypoint.graphStat));
		this.wayKey = waypoint.waypointsID;
		this.mapID = waypoint.mapID;
		this.score = waypoint.score;
		this.atkQueue = [];
		//set up layer
		var worldMap = new createjs.Container();
		var cityMap = new createjs.Container();
		var guiLayer = new createjs.Container();
		this.scene = new createjs.Container();
		stage.addChild(this.scene);
		this.scene.addChild(worldMap);
		this.scene.addChild(cityMap);
		this.scene.addChild(guiLayer);
		this.worldMap = worldMap;
		this.cityMap = cityMap;
		//play bgm
		createjs.Sound.play("play-bgm", {"loop":-1});
		//mute btn
		var muteBtn = new createjs.Shape();
		muteBtn.graphics
			.f("white")
			.mt(-10, 10)
			.lt(-10, -10)
			.lt(0, -10)
			.lt(20, -25)
			.lt(20, 25)
			.lt(0, 10)
			.lt(-10, 10);
		EffectMaster.addButtonEffect(muteBtn);
		muteBtn.on("click", function(e){
			createjs.Sound.setMute(!createjs.Sound.getMute())
			muteBtn.graphics.f(createjs.Sound.getMute()?"gray":"white")
				.mt(-10, 10)
				.lt(-10, -10)
				.lt(0, -10)
				.lt(20, -25)
				.lt(20, 25)
				.lt(0, 10)
				.lt(-10, 10);
		}, this)
		muteBtn.x = 970; muteBtn.y = 180;
		guiLayer.addChild(muteBtn);
		//draw background
		var shape = new createjs.Shape();
		shape.width = 1024;
		shape.height = 768;
		shape.graphics.bf(myItems["bg-grass"]).r(0,0,1024,768);
		worldMap.addChild(shape);
		for(var i=0; i<4; i++){
			var imgNum = Math.floor(Math.random()*2+1);
			drawBitMap(worldMap, myItems["bg-mt"+imgNum], Math.random()*568+100, Math.random()*500+100,100,100);
		}
		//citymap bg
		var bg = new createjs.Bitmap(myItems["bg-city"]);
		bg.scaleX = bg.scaleY = 2;
		bg.addEventListener("click", function(){})
		cityMap.addChild(bg);
		cityMap.visible = false;
		var back = new createjs.Bitmap("resource/icon/Icon-back.png");
		back.x = 980
		back.y = 500
		back.on("mouseover", function(e){
			createjs.Tween.get(back, {"override":true})
				.to({"x":960}, 500, createjs.Ease.getBackIn(2.5));
		});
		back.on("mouseout", function(e){
			createjs.Tween.get(back, {"override":true})
				.to({"x":980}, 500, createjs.Ease.getBackIn(2.5));
		});
		back.addEventListener("click", function(e) {
			createjs.Tween.get(cityMap)
				.to({"scaleX":0, "scaleY":0, "x":PlayScene.currentCity.sprite.x, "y":PlayScene.currentCity.sprite.y}, 500, createjs.Ease.getBackIn(3))
				.call(function(){cityMap.visible = false});
			PlayScene.cursor.x = -100;
			ActionPane.container.removeAllChildren();
		});
		cityMap.addChild(back);
		cityMap.symbolLayer = new createjs.Container();
		cityMap.addChild(cityMap.symbolLayer);
		
		var inspecWin = new createjs.Container();
		guiLayer.addChild(inspecWin);
		var bg = new createjs.Bitmap("resource/UI/InspecWin.png")
		bg.y = 600;
		inspecWin.addChild(bg);
		
		var baseView = new createjs.Container();
		drawBitMap(baseView, "resource/base.png", 50, 620);
		baseView.on("click", function(e){
			PlayScene.endGame("retire");
		}, this);
		inspecWin.addChild(baseView);
	
		inspecWin.stat = new createjs.Text("", "18px arial", "#FFFFFF");
		inspecWin.addChild(inspecWin.stat);
		inspecWin.stat.x = 400;
		inspecWin.stat.y = 620;
		this.stat = inspecWin.stat;
		
		drawBitMap(guiLayer, "resource/UI/TopBar.png", 0, 0);	
	
		this.comment = new createjs.Text("Choose city to explore.", "18px arial", "#FFFFFF");
		guiLayer.addChild(this.comment);
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
		guiLayer.addChild(this.detectIcon);
		this.detectIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Detection level."});
	
		var turnIcon = new createjs.Bitmap("resource/icon/TimeIcon.png");
		guiLayer.addChild(turnIcon);
		turnIcon.x = 920;
		turnIcon.y = 10;
		turnIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Turn."});
	
		this.turnText = new createjs.Text(waypoint.savedTurn||"0", "18px arial", "#FFFFFF");
		guiLayer.addChild(this.turnText);
		this.turnText.x = 970;
		this.turnText.y = 15;
	
		this.cursor = new createjs.Bitmap("resource/target.png")
		guiLayer.addChild(this.cursor);
		this.cursor.x = -100;
		this.cursor.y = -100;
		this.cursor.regX = 32;
		this.cursor.regY = 32;
		createjs.Tween.get(this.cursor, {"loop":true})
			.to({"scaleX":1.2, "scaleY":1.2}, 500)
			.to({"scaleX":1, "scaleY":1}, 500);
	
		var launch = new createjs.Bitmap("resource/UI/NextTurn.png")
		guiLayer.addChild(launch);
		launch.x = 980;
		launch.y = 620;
		launch.addEventListener("click", PlayScene.Launch);
		launch.addEventListener("mouseover", function(){PlayScene.comment.text = "Next step."})
	
		ActionPane.Init(inspecWin);
		QueueList.Init(guiLayer);
	
		this.activeLevel = 0;
		this.activeLevelText = new createjs.Text("0", "18px arial", "#FFF");
		guiLayer.addChild(this.activeLevelText);
		this.activeLevelText.x = 512;
		this.activeLevelText.y = 21;
		this.activeLevelText.textAlign = "center";
	
		var moneyIcon = new createjs.Bitmap("resource/icon/MoneyIcon.png")
		guiLayer.addChild(moneyIcon);
		moneyIcon.x = 10;
		moneyIcon.y = 10;
		moneyIcon.addEventListener("mouseover", function(){PlayScene.comment.text="Score."});
	
		this.scoreText = new createjs.Text(this.score, "18px arial", "#FFF");
		guiLayer.addChild(this.scoreText);
		this.scoreText.x = 60;
		this.scoreText.y = 15;
	
		this.helpScr = new createjs.Bitmap(myItems["help"]);
		this.helpScr.on("click", function(e){}, this); //blocking mouse event go to behind obj
		guiLayer.addChild(this.helpScr);
		this.helpScr.visible = false;
	
		this.helpBtn = new createjs.Bitmap("resource/icon/Icon-help.png");
		guiLayer.addChild(this.helpBtn)
		this.helpBtn.x = 980;
		this.helpBtn.y = 100;
		this.helpBtn.regX = 32;
		this.helpBtn.regY = 32;
		this.helpBtn.on("click", function(e){
			this.helpScr.visible = ! this.helpScr.visible;
		}, this);
		EffectMaster.addButtonEffect(this.helpBtn);
		
		//Place vertices random.
		var cities = [];
		for(var i=0; i<this.graph.machines.length; i++){
			if(!this.graph.machines[i]) continue;
			cities[i] = new City(this.graph.machines[i], this.graph.paths);
			cities[i].Draw(worldMap, 244+(FILL_POSITION[i]%4)*172, 105+Math.floor(FILL_POSITION[i]/4)*112);
		}
		PlayScene.cities = cities;

		//Draw with Force-directed algorithm. 
		//Do iterations. Mostly 100 times is enough.
		for(var i=0; i<100; i++){
			for(var j=0; j<cities.length; j++){
				for(var k=0; k<cities.length; k++){
					var n1 = cities[j].sprite
					var n2 = cities[k].sprite
					var d0 = new Vector(n2.x-n1.x, n2.y-n1.y)
					var di
					if(cities[j].IsConnect(cities[k])){
						//Distance should be 80
						di = d0.unit().multiply(80)
					}else{
						di = d0.unit().multiply(120)
					}
					var d1 = d0.divide(3).subtract(di)
					n1.x += d1.x
					n1.y += d1.y
				}
			}
		}
		//adjust to center
		var sx=sy=0;
		for(var j=0; j<cities.length; j++){
			sx += cities[j].sprite.x
			sy += cities[j].sprite.y
		}
		sx /= cities.length;
		sy /= cities.length;
		var dx = sx-512;
		var dy = sy-324;
		for(var j=0; j<cities.length; j++){
			cities[j].sprite.x -= dx;
			cities[j].sprite.y -= dy;
			cities[j].sprite.x = Math.max(50, Math.min(cities[j].sprite.x, 950));
			cities[j].sprite.y = Math.max(100, Math.min(cities[j].sprite.y, 684));
		}
		
	
		//draw road
		for(var i=0; i<cities.length; i++){
			cities[i].DrawLink(worldMap)
			//put flag on city
			var captured = false;
			for(var j=0; j<cities[i].services.length; j++){
				if(!cities[i].services[j].captured) break;
				captured = true;
			}
			if(captured){
				var options ={
					"images": [myItems["char-flag"]],
					"frames": {"width":64, "height":64, "regX":32, "regY":64, "count":2},
					"animations": {"default":[0,1, "default", 0.5]}
				}
				var sheet = new createjs.SpriteSheet(options);
				var sprite = new createjs.Sprite(sheet, "default");
				sprite.x = cities[i].sprite.x+24;
				sprite.y = cities[i].sprite.y;
				worldMap.addChild(sprite);
			}
		}
	
		worldMap.addEventListener("mousedown", function(evt){
			evt.currentTarget.px = evt.localX;
			evt.currentTarget.py = evt.localY;
		});
	},
	
	erase:function(stage){
		stage.removeChild(this.scene);
	},
	
	Launch:function(){
		var p = PlayScene;
		p.turnText.text = parseInt(p.turnText.text, 10)+1;
	
		if(p.atkQueue.length == 0){
			PlayScene.activeLevel -= 1;
		}
	
		if(p.activeLevel>=8){
			PlayScene.endGame("detected")
			return
		}
		
		var win = true;
		for(var i=0; i<PlayScene.cities.length; i++){
			for(var j=0; j<PlayScene.cities[i].services.length; j++){
				if(!PlayScene.cities[i].services[j].captured) {
					win = false;
					break;
				}
			}
		}
		if(win)
			PlayScene.endGame("Win");
	
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
					sol.city.DrawLink(PlayScene.worldMap);
				}else if(sol.name=="occupier" || sol.name=="occupy"){
					/*deprecated -- occupy automaticly after attack*/
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
					var dstService = PlayScene.graph._sDict[sol.edge.dest];
					var dstMachine = PlayScene.graph._mDict[dstService.machineID];
					
					//Set status
					dstMachine.status = "ready";
					sol.edge.status = "used";
	
					//play sound
					createjs.Sound.play("end-sfx")
					//Occupy
					PlayScene.activeLevel += 1;
					if(sol.integrity==1){
						var service = PlayScene.graph._sDict[sol.edge.dest];
						score += Building.Capture(service, sol)
					}else if(sol.integrity==2){
						var c = City.getCityById(PlayScene.cities, sol.to);
						for(var  j=0; j<c.services.length; j++){
							var service = PlayScene.graph._sDict[c.services[j].serviceID]
							score += Building.Capture(service, sol)
						}
						c.Spread();
						c.DrawLink(PlayScene.worldMap);
						//put flag on city
						var options ={
							"images": [myItems["char-flag"]],
							"frames": {"width":64, "height":64, "regX":32, "regY":64, "count":2},
							"animations": {"default":[0,1, "default", 0.5]}
						}
						var sheet = new createjs.SpriteSheet(options);
						var sprite = new createjs.Sprite(sheet, "default");
						sprite.x = c.sprite.x+24;
						sprite.y = c.sprite.y;
						PlayScene.worldMap.addChild(sprite);
					}
	
					score+= SCORE_SYSTEM.av[sol.vector];
					score+= SCORE_SYSTEM.ac[sol.level];
					score+= SCORE_SYSTEM.au[sol.authen];
				}
	
				//update score and graph status
				if(score > 0 ){
					PlayScene.score += score;
					PlayScene.scoreText.text = PlayScene.score;
					callAPI("POST", "/update-score",
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
					EffectMaster.Explode(PlayScene.cityMap, sol.sprite.x, sol.sprite.y)
				}else{
					EffectMaster.Explode(PlayScene.worldMap, PlayScene.currentCity.sprite.x, PlayScene.currentCity.sprite.y)
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
	},
	
	endGame:function(reason){
		SceneManager.changeScene(EndScene, {"mapID":this.mapID, "reason":reason.toUpperCase()});
		var p = PlayScene
		callAPI("POST", "/end-game", "wpid="+p.wayKey+"&score="+p.score+"&turn="+p.turnText.text+"&reason="+reason);
	}
}