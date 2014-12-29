
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
	this.keyheld = 0;
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
			"default":[0,15,"default"]
		},
		"images":["resource/ninja.png"],
		"frames":{
			"width": 128,
			"height": 128,
			"regX": 64,
			"regY": 64,
			"count": 16
		}
	});

	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.x = x;
	this.sprite.y = y;
	this.sprite.ref = this;
	parent.addChild(this.sprite);
	this.sprite.gotoAndStop("default");
};

Soldier.Action = function (e){
	var t = e.target;
	if(PlayScene.base.machineID != t.ref.from){
		PlayScene.comment.text = "I can't attack from here."
		return;
	}

	if(PlayScene.moneyText.text-t.ref.level > 0){
		PlayScene.moneyText.text = PlayScene.moneyText.text-t.ref.level;
		var atkObj = {
			"start": parseInt(PlayScene.turnText.text, 10),
			"soldier": t.ref,
			"dur": 3,
		};
		t.ref.edge.status="using";
		var dstMachine = getMachineById(getServiceById(t.ref.edge.dest).machineID)
		dstMachine.status="attacking";
		dstMachine.atkCount += 1;
		t.ref.Draw(PlayScene.cityMap, PlayScene.cursor.x, PlayScene.cursor.y);
		QueueList.Add(t.ref.name, atkObj.dur);
		PlayScene.atkQueue.push(atkObj);
		ActionPane.container.removeAllChildren();

		addStep(atkObj);
	}else{
		PlayScene.comment.text = "Insufficient funds.";
	}
}

Soldier.ShowInfo = function(e){
	var t=e.target;
	PlayScene.inspecWin.stat.text = 
		"name: "+t.ref.name+"\n"+
		"range: "+t.ref.vector+"\n"+
		"level: "+t.ref.level+"\n"+
		"key: "+t.ref.keyheld+"/"+(t.ref.authen-1)+"\n"+
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

Explorer.Draw=function(parent, x, y){
	if(parent==null){return}
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":[0,15,"default"]
		},
		"images":["resource/ninja.png"],
		"frames":{
			"width": 128,
			"height": 128,
			"regX": 64,
			"regY": 64,
			"count": 16
		}
	});

	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.x = x;
	this.sprite.y = y;
	this.sprite.ref = this;
	parent.addChild(this.sprite);
	this.sprite.gotoAndStop("default");
}

Explorer.ShowInfo=function(e){
	var t=e.target;
	PlayScene.inspecWin.stat.text = 
		"name: "+t.ref.name+"\n"+
		"city: "+t.ref.city.name+"\n";
}

Explorer.Action=function(e){
	var t=e.target;
	if(PlayScene.moneyText.text-t.ref.level > 0){
		PlayScene.moneyText.text = PlayScene.moneyText.text-t.ref.level;
		var atkObj = {
			"start": parseInt(PlayScene.turnText.text, 10),
			"soldier": t.ref,
			"dur": 2,
		};
		t.ref.city.machine.status="using";
		var dstMachine = t.ref.city.machine;
		dstMachine.status="attacking";
		dstMachine.atkCount += 1;
		QueueList.Add(t.ref.name, atkObj.dur);
		PlayScene.atkQueue.push(atkObj);
		ActionPane.container.removeAllChildren();

		addStep(atkObj)
	}else{
		PlayScene.comment.text = "Insufficient fund.";
	}
}

function addStep(atkObj){

	//fake variable
	var playerID = getCookie("user_id"); var playID=getCookie("play_id");
	//
	var params = 
		"waypoint="+PlayScene.wayKey+"&"+
		"startTurn="+atkObj.start+"&"+
		"endTurn="+(atkObj.start+atkObj.dur)+"&"+
		"solType="+atkObj.soldier.op+"&"+
		"cost="+atkObj.soldier.level+"&"+
		"pathID="+(atkObj.soldier.pathId || 0) +"&"+
		"from="+atkObj.soldier.from +"&"+
		"to="+atkObj.soldier.to;
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
