/* global EffectMaster */

function City(machine, paths){
	this.machine = machine;
	this.cityID = machine.machineID;
	this.name = RANDOM_CITY[this.cityID%RANDOM_CITY.length];
	this.to=[];
	this.services=[];
	
	for(var i=0; i<paths.length; i++){
		if(!paths[i]) continue
		var s = PlayScene.graph._sDict[paths[i].src].machineID
		var d = PlayScene.graph._sDict[paths[i].dest].machineID
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

City.getCityById = function(cities, id){
	for(var i=0 ;i<cities.length; i++){
		var c = cities[i];
		if(c.cityID===id){
			return c;
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
		"images":[myItems["char-city"]],
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
	parent.addChild(this.sprite);
	if(this.machine.status=="hidden"){
		this.sprite.visible=false
	}else if(this.machine.status=="found"){
		this.sprite.gotoAndPlay("default");
	}else if(this.machine.status=="ready"){
		this.sprite.gotoAndPlay("level"+ (Math.ceil(this.services.length/2)));
	}

	EffectMaster.addButtonEffect(this.sprite);
	this.sprite.on("click", City.ClickHandler, this);
	this.sprite.on("mouseover", City.ShowCityInfo, this);
};

City.prototype.drawCityMap = function(cityMap){
	console.log("Same as the last city: "+(PlayScene.currentCity == this))
	if(PlayScene.currentCity == this){
		cityMap.visible = true;
		createjs.Tween.get(cityMap)
			.to({"scaleX":1, "scaleY":1, "x":0, "y":0}, 500, createjs.Ease.getBackIn(3));
		return;
	}
	cityMap.symbolLayer.removeAllChildren();
	var buildings = [];
	for(var i=0; i<this.services.length; i++){
		buildings[i]= new Building(this.services[i], this);
		buildings[i].Draw(cityMap.symbolLayer, 244+(FILL_POSITION[i]%4)*172, 105+Math.floor(FILL_POSITION[i]/4)*112);
		buildings[i].sprite.addEventListener("mouseover", Building.ShowInfo);
		buildings[i].sprite.addEventListener("click", Building.ShowActions);
		
		//draw soldier at where they are attacking.
		for(var j=0;j<PlayScene.atkQueue.length; j++){
			var a = PlayScene.atkQueue[j];
			if(a.soldier.edge && a.soldier.edge.dest==buildings[i].service.serviceID){
				a.soldier.Draw(cityMap.symbolLayer, buildings[i].sprite.x, buildings[i].sprite.y);
				a.soldier.sprite.gotoAndPlay("default");
				buildings[i].status="attacking";
			}
		}
	}
	
	cityMap.visible = true;
	cityMap.scaleX = 0;
	cityMap.scaleY = 0;
	cityMap.x = this.sprite.x;
	cityMap.y = this.sprite.y;
	
	createjs.Tween.get(cityMap)
		.to({"scaleX":1, "scaleY":1, "x":0, "y":0}, 500, createjs.Ease.getBackIn(3));
}

City.prototype.IsConnect = function(city){
	for (var i=0; i<this.to.length; i++){
		if(this.to[i]==city.machine.machineID && city.machine.machineID!=this.machine.machineID){
			return true;
		}
	}
	return false;
}

City.ClickHandler=function(event){
	createjs.Sound.play("click-sfx")
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
		target.drawCityMap(PlayScene.cityMap);
		PlayScene.currentCity = this;
	}
}

City.ShowCityInfo=function(event){
	var t = event.target;
	var info = "";
	info = "name: "+t.ref.name+"\n"+
				 "size: "+t.ref.services.length+"\n"+
				 "status: "+t.ref.machine.status+"\n";
	PlayScene.stat.text = info;
}

City.prototype.Spread=function(){
	for(var j=0; j<this.to.length; j++){
		var c = City.getCityById(PlayScene.cities, this.to[j])
		if(c.machine.status=="hidden"){
			c.machine.status="found";
			c.sprite.visible=true;
		}
	}
}

City.prototype.DrawLink=function(parent){
	for(var i=0; i<this.to.length; i++){
		var c = City.getCityById(PlayScene.cities, this.to[i])
		if(this.machine.status=="ready" && c.sprite.visible){
			var road = new createjs.Shape()
			road.graphics.ss(2).s("#FFF").mt(this.sprite.x, this.sprite.y).lt(c.sprite.x, c.sprite.y).es()
			parent.addChild(road);
			parent.addChild(this.sprite);
			parent.addChild(c.sprite);
		}
	}
}