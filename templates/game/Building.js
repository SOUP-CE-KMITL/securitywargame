
function Building(service, city){
	var s = getServiceById(service)
	this.service=s;
	s.captured = false;  //TODO: this should be in datastore too.
	this.name=s.name;
	this.buildingID = s.serviceID;
	if (Building.supportedServices.indexOf(this.name) >= 0){
		this.sName = this.name;
	}else{
		this.sName = "lab";
	}
	this.city = city;
	
}

Building.supportedServices = ["hq", "www", "db"];

Building.prototype.Draw=function(parent, x, y){
	this.sheet = new createjs.SpriteSheet({
		"animations":{
			"default":[0,0,"default"]
		},
		"images":["resource/"+this.sName+".png"],
		"frames":{
			"width": 512,
			"height": 512,
			"regX": 256,
			"regY": 256,
			"count": 1
		}
	});
	
	this.sprite = new createjs.Sprite(this.sheet, "default");
	this.sprite.ref = this;
	this.sprite.scaleX = 0.25;
	this.sprite.scaleY = 0.25;
	this.sprite.x = x;
	this.sprite.y = y;
	parent.addChild(this.sprite);
	this.sprite.gotoAndStop("default");

	this.sprite.on("mouseover", function(e){
		createjs.Tween.get(this.sprite)
			.to({"scaleX":0.35, "scaleY":0.35}, 250);
	}, this);

	this.sprite.on("mouseout", function(e){
		createjs.Tween.get(this.sprite)
			.to({"scaleX":.25, "scaleY":.25}, 250);
	}, this);
};

Building.ShowInfo=function(event){
	var t = event.target;
	var info = "name: "+t.ref.sName+"\n"+
	           "city: "+t.ref.city.name+"\n"+
	           "status: "+t.ref.service.status+"\n"+
	           "captured: "+t.ref.service.captured+"\n";
	PlayScene.inspecWin.stat.text = info;
}

Building.ShowActions=function(event){
	var t = event.target.ref;
	var edges = PlayScene.graph.paths;

	if(t.service.status=="found"){
		//Show soldier btns.
		var soldier = [];
		for(var i=0; i<edges.length; i++){
			if (edges[i].dest == t.service.serviceID && edges[i].status=="unused"){
				soldier[soldier.length] = edges[i];
			}
		}
		var actions = [];
		for(var i=0; i<soldier.length; i++){
			actions[i]={};
			actions[i].img="resource/icon/Icon-Soldier.png";
			actions[i].soldier= new Soldier(soldier[i]);
			actions[i].actionOf=t;
		}
		ActionPane.SetActions(actions);
	}

	//set cursor position
	PlayScene.cursor.x = t.sprite.x;
	PlayScene.cursor.y = t.sprite.y;

	//Change base
	/*
	PlayScene.base = t.city;
	PlayScene.baseCity = t.city.name;
	PlayScene.baseView.removeChild(PlayScene.baseView.bitmap)
	var bitmap = new createjs.Bitmap("resource/"+t.sName+".png");
	bitmap.x = 50;
	bitmap.y = 620;
	bitmap.scaleX = 0.25;
	bitmap.scaleY = 0.25;
	PlayScene.baseView.addChild(bitmap);
	PlayScene.baseView.bitmap = bitmap;
	PlayScene.baseView.stat.text = "name: "+t.sName+"\nrandom: "+Math.random()*300+"\n"
	*/
}
