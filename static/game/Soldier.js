
function Soldier(sol){
	this.edge = sol;
	this.name = "John Doe";
	this.vector = 2
	this.level = 2
	this.authen = 2
	this.confident = 2
	this.integrity = 2
	this.availability = 2
	this.cwe = "buffer overflow"
	/*
	this.vector = sol.cvss.av;
	this.complex = sol.cvss.ac;
	this.authen = sol.cvss.au;
	this.confident = sol.cvss.c;
	this.integrity = sol.cvss.i;
	this.availability = sol.cvss.a;
	this.cwe = sol.cvss.cwe;
	*/
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
}

Soldier.ShowInfo = function(e){
	var t=e.target;
	PlayScene.inspecWin.stat.text = 
		"name: "+t.ref.cwe+"\n"+
		"range: "+t.ref.vector+"\n"+
		"level: "+t.ref.level+"\n"+
		"key: "+t.ref.authen+"\n"+
		"occupiable: "+t.ref.confident+"\n"+
		"capacity: "+t.ref.integrity+"\n"+
		"damage: "+t.ref.availability+"\n";
}

function Explorer(city){
	this.name="explorer";
	this.city=city;
	this.level=2;
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
}