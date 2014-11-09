
function PlayScene(){
	this.inited = false;
}


PlayScene.prototype.Init = function(){
	this.inited = true;
	this.scene = new createjs.Container();
	this.objLayer = new createjs.Container();
	this.guiLayer = new createjs.Container();
	this.scene.addChild(this.objLayer);
	this.scene.addChild(this.guiLayer);

	this.objLayer.addChild(new createjs.Bitmap("resource/bg.png"));

	loader = new XMLLoader("ahtkZXZ-Y3liZXItc2VjdXJpdHktd2FyLWdhbWVyEgsSBUdyYXBoGICAgICA4JcJDA", this);

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

	

	ActionPane.Init(this.inspecWin);
	QueueList.Init(this.guiLayer);
	
	PlayScene.objLayer = this.objLayer;
	PlayScene.cityMap = null;
	PlayScene.inspecWin = this.inspecWin;
	PlayScene.baseView = this.baseView;
	PlayScene.turnText = this.turnText;
	PlayScene.cursor = this.cursor;
	PlayScene.base = null;
	PlayScene.moneyText = this.moneyText;
	PlayScene.queueList = this.queueList;
	PlayScene.atkQueue = [];
	PlayScene.currentCity = null;
}

PlayScene.prototype.Show = function(stage){
	stage.addChild(this.scene);
	PlayScene.turnText.text = "0"
}

PlayScene.prototype.OnLoadComplete = function(jGraph, p){
	p.mapDrawer = new MapDrawer(jGraph);

	PlayScene.graph = jGraph;

	var cities = p.mapDrawer.DrawWorldMap(p.objLayer);
	for(var i=0; i<cities.length; i++){
		cities[i].sprite.addEventListener("click", City.ShowCityMap);
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
			var dstMachine = getMachineById(getServiceById(sol.edge.dest).machineID);
			var im = excImpact(dstMachine.impact);
			
			//Check if it has better impact
			dstMachine.status = "found";
			sol.edge.status = "used";
			if(im.c < sol.confident){
				var value = sol.confident - im.c;
				PlayScene.moneyText.text = parseInt(PlayScene.moneyText.text, 10) + value;
				dstMachine.impact += value*9
			}
			if(dstMachine.impact.i%3 < sol.confident){
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

	for(var i=0; i<QueueList.names.length; i++){
		QueueList.remTurns[i].text = QueueList.remTurns[i].text - 1;
	}
	QueueList.Remove();
}

function getServiceById(id){
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
