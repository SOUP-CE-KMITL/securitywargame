
function City(machine, paths){
	this.machine = machine;
	this.cityID = machine.machineID;
	this.name = machine.name;
	this.to=[];

	for(var i=0; i<paths.length; i++){
		if(getServiceById(paths[i].src).machineID==machine.machineID && this.to.indexOf(machine.machineID)==-1){
			this.to.push(machine.machineID);
		}
	}
}

City.prototype.Draw = function(parent, x, y){
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":[0,0,"default"]
		},
		"images":["resource/city.png"],
		"frames":{
			"width": 169,
			"height": 135,
			"regX": 0,
			"regY": 0,
			"count": 1
		}
	});

	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.ref = this;
	this.sprite.x = x;
	this.sprite.y = y;
	parent.addChild(this.sprite);
	this.sprite.gotoAndStop("default");
};

City.prototype.IsConnect = function(city){
	for (var i=0; i<this.to.length; i++){
		if(this.to[i]==city.machine && city.machine!=this.machine){
			return true;
		}
	}
	return false;
}

City.ShowCityMap=function(event){
	var target = event.target.ref;
	var cityMap = new createjs.Container();
	PlayScene.cityMap = cityMap;
	PlayScene.objLayer.addChild(cityMap);
	var bg = new createjs.Shape();
	bg.graphics.f("black").r(0,0,1024,768);
	bg.addEventListener("click", function(){})
	cityMap.addChild(bg);
	var buildings = new Array();
	for(var i=0; i<target.machine.services.length; i++){
		buildings[i]= new Building(target.machine.services[i], target);
		buildings[i].Draw(cityMap, (i%4)*100, Math.floor(i/4)*100);
		buildings[i].sprite.addEventListener("mouseover", Building.ShowInfo);
		buildings[i].sprite.addEventListener("click", Building.ShowActions);
		for(var j=0;j<PlayScene.atkQueue.length; j++){
			var a = PlayScene.atkQueue[j];
			if(a.soldier.edge.status=="attacking" && a.soldier.edge.dest==buildings[i].service.serviceID){
				a.soldier.Draw(cityMap, buildings[i].sprite.x, buildings[i].sprite.y);
				buildings[i].status="attacking";
			}
		}
	}

	//draw road between buildings
	/*
	for(var i=0; i<PlayScene.graph.paths.length; i++){
		var a=b=null;

		//local road
		for(var j=0; j<buildings.length; j++){
			if(PlayScene.graph.paths[i].sMachine.name==buildings[j].name){
				if(PlayScene.graph.paths[i].dMachine.name==buildings[j].name){
					if(buildings[j].name==PlayScene.graph.paths[i].sService){
						a = buildings[j].sprite;
					}
					if(buildings[j].name==PlayScene.graph.paths[i].dService){
						b = buildings[j].sprite;
					}
				}
			}

			if(a!=null && b!=null){
				var g = createjs.Graphics;
				var road = new g().beginStroke("#FFFFFF").moveTo(a.x, a.y).lineTo(b.x, b.y).endStroke();
				var shape = new createjs.Shape(road);
				cityMap.addChild(shape);
			}
		}
	}
	*/

	var back = new createjs.Shape();
	back.graphics.f("red").r(900,500, 50,50);
	back.addEventListener("click", function(e) {
		PlayScene.objLayer.removeChild(cityMap);
		PlayScene.citymap = null;
		PlayScene.cursor.x = -100;
		ActionPane.container.removeAllChildren();
	});
	cityMap.addChild(back);
	PlayScene.currentCity = target;
}

City.ShowCityInfo=function(event){
	var t = event.target;
	var info = "";
	info = "name: "+t.ref.machine.name+"\n"+
				 "size: "+t.ref.to.length+"\n";
	PlayScene.inspecWin.stat.text = info;
}