
function City(machine, paths){
	this.machine = machine;
	this.cityID = machine.machineID;
	this.name = machine.name;
	this.to=[];
	this.services=[];

	for(var i=0; i<paths.length; i++){
		var s = getServiceById(paths[i].src).machineID
		var d = getServiceById(paths[i].dest).machineID
		if(s==machine.machineID && this.to.indexOf(d)==-1 && s!=d){
			this.to.push(d);
		}
	}

	for(var i=0; i<PlayScene.graph.services.length; i++){
		var a = PlayScene.graph.services[i];
		if(a.machineID==this.cityID){
			this.services.push(a);
		}
	}
}

City.prototype.Draw = function(parent, x, y){
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":{
				"frames":[0,1,2,3,2,1]
			},
			"level1":[4,7,false],
			"level2":[4,11,false],
			"level3":[4,15,false]
		},
		"images":["resource/char/char-city.png"],
		"frames":{
			"width": 128,
			"height": 128,
			"regX": 64,
			"regY": 96,
			"count": 16
		}
	});

	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.ref = this;
	this.sprite.x = x;
	this.sprite.y = y;
	this.sprite.scaleX = 0.75;
	this.sprite.scaleY = 0.75;
	parent.addChild(this.sprite);
	if(this.machine.status=="hidden"){
		this.sprite.visible=false
	}else if(this.machine.status=="found"){
		this.sprite.gotoAndPlay("default");
	}else if(this.machine.status=="ready"){
		this.sprite.gotoAndPlay("level"+ (Math.ceil(this.services.length/2)));
	}

	this.sprite.on("mouseover", function(e){
		createjs.Tween.get(this.sprite)
			.to({"scaleX":0.85, "scaleY":0.85}, 250);
	}, this);

	this.sprite.on("mouseout", function(e){
		createjs.Tween.get(this.sprite)
			.to({"scaleX":.75, "scaleY":.75}, 250);
	}, this);

};

City.prototype.IsConnect = function(city){
	for (var i=0; i<this.to.length; i++){
		if(this.to[i]==city.machine.machineID && city.machine.machineID!=this.machine.machineID){
			return true;
		}
	}
	return false;
}

City.ClickHandler=function(event){
	var target = event.target.ref;
	if(target.machine.status == "found"){
		//set cursor position
		PlayScene.cursor.x = target.sprite.x;
		PlayScene.cursor.y = target.sprite.y;
		var action={
			"img": "resource/icon/Icon-Scout.png",
			"soldier": new Explorer(target)
		}
		ActionPane.SetActions([action]);

	}else /*if(target.machine.status=="ready")*/{
		var cityMap = new createjs.Container();
		PlayScene.cityMap = cityMap;
		PlayScene.objLayer.addChild(cityMap);
		var bg = new createjs.Bitmap("resource/bg/bg-city.png")
		bg.scaleX = bg.scaleY = 2;
		bg.addEventListener("click", function(){})
		cityMap.addChild(bg);
		var buildings = new Array();
		PlayScene.buildings = [];
		for(var i=0; i<target.machine.services.length; i++){
			buildings[i]= new Building(target.machine.services[i], target);
			buildings[i].Draw(cityMap, 244+(FILL_POSITION[i]%4)*172, 105+Math.floor(FILL_POSITION[i]/4)*112);
			buildings[i].sprite.addEventListener("mouseover", Building.ShowInfo);
			buildings[i].sprite.addEventListener("click", Building.ShowActions);
			for(var j=0;j<PlayScene.atkQueue.length; j++){
				var a = PlayScene.atkQueue[j];
				if(a.soldier.edge && a.soldier.edge.status=="attacking" && a.soldier.edge.dest==buildings[i].service.serviceID){
					a.soldier.Draw(cityMap, buildings[i].sprite.x, buildings[i].sprite.y);
					buildings[i].status="attacking";
				}
			}
			PlayScene.buildings.push(buildings[i])
		}

		PlayScene.currentCity = target;
		var p = PlayScene;
		for (var i=0; i<p.atkQueue.length; i++){
			//redraw character in cityMap
			if (PlayScene.cityMap &&  p.atkQueue[i].soldier.to == PlayScene.currentCity.cityID){
				var b = getBuildingById(p.atkQueue[i].soldier.edge.dest)
				if(b){
					p.atkQueue[i].soldier.Draw(p.cityMap, b.sprite.x, b.sprite.y);
					p.atkQueue[i].soldier.sprite.gotoAndPlay("default");
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

		var back = new createjs.Bitmap("resource/icon/Icon-back.png");
		back.x = 980
		back.y = 500
		back.on("mouseover", function(e){
			createjs.Tween.get(back, {"override":true})
				.to({"x":960}, 500, createjs.Ease.powIn);
		});
		back.on("mouseout", function(e){
			createjs.Tween.get(back, {"override":true})
				.to({"x":980}, 500);
		});
		back.addEventListener("click", function(e) {
			PlayScene.objLayer.removeChild(cityMap);
			PlayScene.cityMap = null;
			PlayScene.cursor.x = -100;
			ActionPane.container.removeAllChildren();
		});
		cityMap.addChild(back);
	}
}

City.ShowCityInfo=function(event){
	var t = event.target;
	var info = "";
	info = "name: "+t.ref.machine.name+"\n"+
				 "size: "+t.ref.services.length+"\n"+
				 "status: "+t.ref.machine.status+"\n";
	PlayScene.inspecWin.stat.text = info;
}

City.prototype.Spread=function(){
	for(var j=0; j<this.to.length; j++){
		var c = getCityById(this.to[j])
		if(c.machine.status=="hidden"){
			c.machine.status="found";
			c.sprite.visible=true;
		}
	}
}

City.prototype.DrawLink=function(){
	for(var i=0; i<this.to.length; i++){
		var c = getCityById(this.to[i])
		console.log(this.machine.status=="ready" && c.sprite.visible)
		if(this.machine.status=="ready" && c.sprite.visible){
			var road = new createjs.Shape()
			road.graphics.ss(2).s("#FFF").mt(this.sprite.x, this.sprite.y).lt(c.sprite.x, c.sprite.y).es()
			PlayScene.objLayer.addChildAt(road, PlayScene.objLayer.getChildIndex(PlayScene.cities[0].sprite))
		}
	}
}