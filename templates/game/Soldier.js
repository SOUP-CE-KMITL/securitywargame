
function Soldier(sol){
	/*
	console.log(sol);
	this.edge = sol;
	this.name = "John Doe";
	this.vector = 2
	this.level = 2
	this.authen = 2
	this.confident = 2
	this.integrity = 2
	this.availability = 2
	this.cwe = "buffer overflow"
	*/

	this.edge = sol;
	this.vector = sol.gained_access;
	this.level = sol.access_complexity;
	this.authen = sol.authentication;
	this.confident = sol.confidentiality_impact;
	this.integrity = sol.integrity_impact;
	this.availability = sol.availability_impact;
	this.name = sol.name;
	this.op = sol.cwe || "unknown";
	this.from  = getServiceById(sol.src).machineID;
	this.to = getServiceById(sol.dest).machineID;
	this.pathId = sol.pathID;
}

Soldier.prototype.Draw = function (parent,x,y){
	if(parent==null){return}
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":{
				"frames":[0,1,2,3,2,1]
			},
			"run":{
				"frames":[0,1,2,3,2,1]
			},
		},
		"images":["resource/char/char-scout-test.png"],
		"frames":{
			"width": 128,
			"height": 128,
			"regX": 64,
			"regY": 64,
			"count": 4
		}
	});
	
	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.x = x;
	this.sprite.y = y;
	this.sprite.ref = this;
	parent.addChild(this.sprite);
	this.sprite.gotoAndStop("default");

	createjs.Tween.get(this.sprite, {"loop":true})
		.to({"rotation":10}, 1000)
		.to({"rotation":-10}, 2000)
		.to({"rotation":0}, 1000);
};

Soldier.Action = function (e){
	var t = e.target;
	if( !getServiceById(t.ref.edge.src).captured ){
		PlayScene.comment.text = "I can't attack from here."
		return;
	}

	if( t.ref.edge.keyHeld < t.ref.authen){
		var atkObj = {
			"start": parseInt(PlayScene.turnText.text, 10),
			"soldier": {
				forPath: t.ref.edge,
				name: undefined,
				city: getCityById(getServiceById(t.ref.to).machineID),
				level: 1,
				op: undefined,
				from: PlayScene.base && PlayScene.base.machineID || 0,
				to: getServiceById(t.ref.to).machineID,
			},
			"dur": undefined,
			"ci": 0,
			"ii": 0,
			"ai": 0,
			"score": 10,
			"cve_id": 0
		};

		var building  = t.actionOf;
		var w1 = WindowManager.NewWindow(PlayScene.guiLayer, 362, 284, 300, 150);
		w1.NewLabel("You need key to perform this action.\nSend someone to get a key.", 150, 20);
		w1.NewImgButton("resource/icon/Icon-Picklocker.png", 100, 100, function(){
			var s = new Picklocker();
			PlayScene.guiLayer.removeChild(w1.winGroup);
			atkObj.soldier.name = s.name;
			atkObj.soldier.op = s.op;
			atkObj.dur = 1;
			QueueList.Add(atkObj.soldier.name, atkObj.dur);
			PlayScene.atkQueue.push(atkObj);
			addStep(atkObj);
			s.Draw(PlayScene.cityMap, building.sprite.x, building.sprite.y);
		});
		w1.NewImgButton("resource/icon/Icon-Phishing.png", 200, 100, function(){
			PlayScene.guiLayer.removeChild(w1.winGroup);
			atkObj.soldier.name = "Locksmith";
			atkObj.soldier.op = "Phishing P/W crack";
			atkObj.dur = 3;
			QueueList.Add(atkObj.soldier.name, atkObj.dur);
			PlayScene.atkQueue.push(atkObj);
			addStep(atkObj);
		});
		return;
	}

	//if(PlayScene.moneyText.text-t.ref.level > 0){
		var to = getServiceById(t.ref.to)
		var score = SCORE_SYSTEM.av[t.ref.vector];
		score += SCORE_SYSTEM.ac[t.ref.level];
		score += SCORE_SYSTEM.au[t.ref.authen];
		score += SCORE_SYSTEM.ai[Math.max(0, t.ref.availability - to.impact.a)];
		score += SCORE_SYSTEM.ii[Math.max(0, t.ref.integrity - to.impact.i)];
		score += SCORE_SYSTEM.ci[Math.max(0, t.ref.confident - to.impact.c)];

		var atkObj = {
			"start": parseInt(PlayScene.turnText.text, 10),
			"soldier": t.ref,
			"dur": 3,
			"ci": t.ref.confident,
			"ii": t.ref.integrity,
			"ai": t.ref.availability,
			"score": score,
			"cve_id": 0
		};
		t.ref.edge.status="using";
		var dstMachine = getMachineById(getServiceById(t.ref.edge.dest).machineID)
		dstMachine.status="attacking";
		dstMachine.atkCount += 1;
		t.ref.Draw(PlayScene.cityMap, PlayScene.cursor.x, PlayScene.cursor.y);
		t.ref.sprite.gotoAndPlay("run");
		QueueList.Add(t.ref.name, atkObj.dur);
		PlayScene.atkQueue.push(atkObj);
		ActionPane.container.removeAllChildren();

		addStep(atkObj);
}

Soldier.ShowInfo = function(e){
	var t=e.target;
	console.log(t);
	PlayScene.inspecWin.stat.text = 
		"name: "+t.ref.name+"\n"+
		"range: "+t.ref.vector+"\n"+
		"level: "+t.ref.level+"\n"+
		"key: "+t.ref.edge.keyHeld+"/"+(t.ref.authen)+"\n"+
		"occupiable: "+t.ref.confident+"\n"+
		"capacity: "+t.ref.integrity+"\n"+
		"damage: "+t.ref.availability+"\n";
}

function Explorer(city){
	this.name="explorer";
	this.city=city;
	this.level=2;
	this.op = "scan";
	this.from = PlayScene.base.machineID;
	this.to = city.machine.machineID;
}

Explorer.prototype.Draw=function(parent, x, y){
	if(parent==null){return}
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":[0,3,"default"]
		},
		"images":["resource/char/char-scout-test.png"],
		"frames":{
			"width": 128,
			"height": 46,
			"regX": 64,
			"regY": 23,
			"count": 4
		}
	});
	
	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.x = x;
	this.sprite.y = y-64;
	this.sprite.ref = this;
	//parent.addChild(this.sprite);
	this.sprite.gotoAndPlay("default");

	this.scan0 = new createjs.Bitmap("resource/fx/scan0.png");
	this.scan0.x = x;
	this.scan0.y = y;
	this.scan0.regX = this.scan0.regY = 32;
	parent.addChild(this.scan0);

	this.scan1 = new createjs.Bitmap("resource/fx/scan1.png");
	this.scan1.x = x;
	this.scan1.y = y;
	this.scan1.regX = 32;
	this.scan1.regY = 32;
	parent.addChild(this.scan1);

	parent.addChild(this.sprite);

	createjs.Tween.get(this.sprite, {"loop":true})
		.to({"rotation":10}, 1000)
		.to({"rotation":-10}, 2000)
		.to({"rotation":0}, 1000);

	createjs.Tween.get(this.scan1, {"loop":true})
		.to({"rotation":360}, 4000);
}

Explorer.prototype.Erase=function(){
	createjs.Tween.get(this.sprite, {"override":true})
		.to({"scaleX":0.01, "scaleY":0.01}, 500, createjs.Ease.backIn);
	createjs.Tween.get(this.scan0)
		.to({"scaleX":1.5, "scaleY":1.5, "alpha":0}, 500);
	createjs.Tween.get(this.scan1, {"override":true})
		.to({"scaleX":1.5, "scaleY":1.5, "alpha":0}, 500)
		.call(function(){
			createjs.Tween.removeTweens(this.sprite);
			createjs.Tween.removeTweens(this.scan1);
			createjs.Tween.removeTweens(this.scan0);
			PlayScene.objLayer.removeChild(this.scan1);
			PlayScene.objLayer.removeChild(this.scan0);
			PlayScene.objLayer.removeChild(this.sprite);
		}, null, this);
	
}

Explorer.ShowInfo=function(e){
	var t=e.target;
	PlayScene.inspecWin.stat.text = 
		"name: "+t.ref.name+"\n"+
		"city: "+t.ref.city.name+"\n";
}

Explorer.Action=function(e){
	var t=e.target;
	//if(PlayScene.moneyText.text-t.ref.level > 0){
		//PlayScene.moneyText.text = PlayScene.moneyText.text-t.ref.level;
		var atkObj = {
			"start": parseInt(PlayScene.turnText.text, 10),
			"soldier": t.ref,
			"dur": 2,
			"ai": 0,
			"ci": 0,
			"ii": 0,
			"score": 5,
			"cve_id": 0
		};
		t.ref.city.machine.status="using";
		var dstMachine = t.ref.city.machine;
		dstMachine.status="attacking";
		dstMachine.atkCount += 1;
		QueueList.Add(t.ref.name, atkObj.dur);
		PlayScene.atkQueue.push(atkObj);
		ActionPane.container.removeAllChildren();
		t.ref.Draw(PlayScene.objLayer, PlayScene.cursor.x, PlayScene.cursor.y);
		addStep(atkObj)
	/*}else{
		PlayScene.comment.text = "Insufficient fund.";
	}*/
}

function Picklocker(){
	this.name = "Picklocker";
	this.op = "Brute-force password cracking";
}
Picklocker.prototype.Draw=function(parent, x, y){
	if(parent==null){return}
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":[0,0,"default"],
			"picking":[1,6,"picking",0.25],
			"success":{"frames":[1,8], "next":null, "speed":0.25},
			"fail":{"frames":[1,7], "next":null, "speed":0.25}
		},
		"images":["resource/char/char-picklock.png"],
		"frames":{
			"width": 64,
			"height": 64,
			"regX": 32,
			"regY": 32,
			"count": 9
		}
	});
	
	this.sprite = new createjs.Sprite(this.sheet, "picking");
	this.sprite.x = x;
	this.sprite.y = y;
	this.sprite.ref = this;
	parent.addChild(this.sprite);
}

function addStep(atkObj){

	//fake variable
	var playerID = getCookie("user_id"); var playID=getCookie("play_id");
	//
	var params = 
		"waypoint="+PlayScene.wayKey+"&"+
		"startTurn="+atkObj.start+"&"+
		"dur="+atkObj.dur+"&"+
		"endTurn="+(atkObj.start+atkObj.dur)+"&"+
		"solType="+atkObj.soldier.op+"&"+
		"cost="+atkObj.soldier.level+"&"+
		"pathID="+(atkObj.soldier.pathId || 0) +"&"+
		"from="+atkObj.soldier.from +"&"+
		"to="+atkObj.soldier.to +"&"+
		"ci="+atkObj.ci +"&"+
		"ai="+atkObj.ai+"&"+
		"ii="+atkObj.ii +"&"+
		"score="+atkObj.score +"&"+
		"cve_id="+atkObj.cve_id;
	console.log(params);

	var req;
	if (window.XMLHttpRequest){
	  req=new XMLHttpRequest();
	}else{
	  req=new ActiveXObject("Microsoft.XMLHTTP");
	}
	req.open("POST","/add-step",false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send(params);
}
