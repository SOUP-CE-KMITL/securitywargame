
function PlayScene(){
	this.inited = false;
}


PlayScene.CAMP = {
	"name":"camp",
	"machineID":0,
	"service":{"serviceID":0, "name":"os", "machineID":0}
}


PlayScene.prototype.Init = function(){
	this.inited = true;
	this.scene = new createjs.Container();
	this.objLayer = new createjs.Container();
	this.guiLayer = new createjs.Container();
	this.scene.addChild(this.objLayer);
	this.scene.addChild(this.guiLayer);

	this.objLayer.addChild(new createjs.Bitmap("resource/bg.png"));


	this.inspecWin = new createjs.Container();
	this.guiLayer.addChild(this.inspecWin);
	var bg = new createjs.Bitmap("resource/inspecWin.png")
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

	this.turnText = new createjs.Text("0", "18px arial", "#FFFFFF");
	this.guiLayer.addChild(this.turnText);
	this.turnText.x = 980;
	this.turnText.y = 20;

	this.cursor = new createjs.Bitmap("resource/target.png")
	this.guiLayer.addChild(this.cursor);
	this.cursor.x = -100;
	this.cursor.y = -100;

	this.launch = new createjs.Bitmap("resource/launch.png")
	this.guiLayer.addChild(this.launch);
	this.launch.x = 1000;
	this.launch.y = 668;
	this.launch.addEventListener("click", PlayScene.Launch);

	this.moneyText = new createjs.Text("10", "18px arial", "#FFFFFF");
	this.guiLayer.addChild(this.moneyText);
	this.moneyText.x = 10;
	this.moneyText.y = 10;

	this.comment = new createjs.Text("This is comment.", "18px arial", "#FFFFFF");
	this.guiLayer.addChild(this.comment);
	this.comment.x = 10;
	this.comment.y = 558;

	ActionPane.Init(this.inspecWin);
	QueueList.Init(this.guiLayer);
	
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

	
}

PlayScene.prototype.Show = function(stage, params){
	stage.addChild(this.scene);
	PlayScene.turnText.text = "0"
	new XMLLoader(SceneManager.params, this);

	var req;
	if (window.XMLHttpRequest){
	  req=new XMLHttpRequest();
	}else{
	  req=new ActiveXObject("Microsoft.XMLHTTP");
	}

	req.open("POST","/create-waypoint",false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send("mapID="+SceneManager.params+"&playerID="+getCookie("user_id"));
	PlayScene.wayKey = req.responseText
}

PlayScene.prototype.OnLoadComplete = function(jGraph, p){
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

	function excImpact(impact){
		var ret={};
		ret.c = Math.floor(Math.floor(impact/3)/3)%3;
		ret.i = Math.floor(impact/3)%3
		ret.a = impact%3
		return ret;
	}

	var p = PlayScene;
	p.turnText.text = parseInt(p.turnText.text, 10)+1;
	for (var i=0; i<p.atkQueue.length; i++){
		if (p.atkQueue[i].start + p.atkQueue[i].dur == parseInt(p.turnText.text, 10)){
			var sol = p.atkQueue[i].soldier;
			if(sol.name=="explorer"){
				var dstMachine=sol.city.machine;
				dstMachine.status="ready";
				p.atkQueue.splice(i,1);
				i-=1;
				sol.city.sprite.gotoAndStop("level1");
				//sol.city.Spread();
			}else if(sol.name=="occupier" || sol.name=="occupy"){
				var c = sol.city;
				c.status = "occupied";
				c.Spread();
				console.log("occupied!");
			}else{ //attacker
				var dstMachine = getMachineById(getServiceById(sol.edge.dest).machineID);
				var im = excImpact(dstMachine.impact);
				
				//Occupy
				if(sol.integrity > 0){
					var w1 = WindowManager.NewWindow(PlayScene.guiLayer, 512, 384, 200, 100);
					w1.NewLabel("Do you want to occupy "+sol.edge.dest.name, 100, 20);
					w1.NewButton("yes", 10, 50, 80, 60, function(){
						PlayScene.guiLayer.removeChild(w1.winGroup);
						occupy(sol);
					});
					w1.NewButton("no", 100, 50, 80, 60, function(){
						PlayScene.guiLayer.removeChild(w1.winGroup);
					});
				}

				//Check if it has better impact
				dstMachine.status = "ready";
				sol.edge.status = "used";
				if(im.c < sol.confident){
					var value = sol.confident - im.c;
					PlayScene.moneyText.text = parseInt(PlayScene.moneyText.text, 10) + value;
					dstMachine.impact += value*9
				}
				if(dstMachine.impact.i%3 < sol.integrity){
					var value = sol.confident - im.i;
					PlayScene.moneyText.text = parseInt(PlayScene.moneyText.text, 10) + value;
					dstMachine.impact += value*3
				}
				if(dstMachine.impact.a < sol.availability){
					var value = sol.confident - im.a;
					PlayScene.moneyText.text = parseInt(PlayScene.moneyText.text, 10) + value;
					dstMachine.impact += value
				}
			}
		}
	}

	for(var i=0; i<QueueList.names.length; i++){
		QueueList.remTurns[i].text = QueueList.remTurns[i].text - 1;
	}
	QueueList.Remove();
}

function occupy(sol){
	var atkObj = {
		"start": parseInt(PlayScene.turnText.text, 10),
		"soldier": {
			name:"occupier",
			city: getCityById(getServiceById(sol.edge.dest).machineID),
			level: 1,
			op: "occupy",
			from: PlayScene.base && PlayScene.base.machineID || 0,
			to: getServiceById(sol.edge.dest).machineID,
		},
		"dur": 5,
	};
	QueueList.Add(atkObj.soldier.name, atkObj.dur);
	PlayScene.atkQueue.push(atkObj);
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
