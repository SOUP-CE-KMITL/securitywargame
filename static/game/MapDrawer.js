
function MapDrawer(graph){
	this.graph=graph;
}

MapDrawer.prototype.Format = function(){

	for(var i=0; i<this.graph.services.length; i++){
		var s = this.graph.services[i];
		s.status = s.status || "found";
		s.impact = {"a":0, "i":0, "c":0}; //s.impact || 0;
		s.captured = false;

		var m = getMachineById(s.machineID);
		m.services = m.services || [];
		if(m.services.indexOf(s.serviceID)==-1){	
			m.services.push(s.serviceID);
		}

	}

	for(var j=0; j<this.graph.machines.length; j++){
		var m = this.graph.machines[j];
		m.status = m.status || "hidden";//this should be hidden. using found for testing.
		m.impact = m.impact || 0;
	}

	for(var i=0; i<this.graph.paths.length; i++){
		var p = this.graph.paths[i];
		p.status = p.status || "unused";
	}
}

MapDrawer.prototype.DrawWorldMap=function(layer){
	this.layer=layer
	this.Format();

	//Set up constant
	var K = Math.sqrt((1024*678)/Math.abs(this.graph.machines.length))

	//Place vertices random.
	var cities = [];
	for(var i=0; i<this.graph.machines.length; i++){
		cities[i] = new City(this.graph.machines[i], this.graph.paths);
		cities[i].Draw(layer, Math.random()*924, Math.random()*568);
	}
	PlayScene.cities = cities;

	//Draw with Force-directed algorithm. 
	//Do iterations. Mostly 100 times is enough.
	for(var i=0; i<1; i++){
		//calculat repulsive force
		for(var j=0; j<cities.length; j++){
			cities[j].disp = new Vector(0,0);
			for(var k=0; k<cities.length; k++){
				//if city[j] connect city[k]
				if(cities[j].IsConnect(cities[k])){
					var x = cities[j].sprite.x - cities[k].sprite.x;
					var y = cities[j].sprite.y - cities[k].sprite.y;
					var delta = new Vector(x,y);
					var mag = (K*12/(delta.length()));
					console.log("repulsive: "+mag);
					var diff = delta.unit();
					diff.x *= mag;
					diff.y *= mag;
					cities[j].disp = cities[j].disp.add(diff);
				}
			}
		}

		//calculate attractive force
		for(var j=0; j<this.graph.paths.length; j++){
			var u = getMachineById (this.graph.paths[j].src)
			var v = getMachineById (this.graph.paths[j].dest)
			var x = 0//v.sprite.x - u.sprite.x
			var y = 0//v.sprite.y - u.sprite.y
			var delta = new Vector(x,y);
			var mag = delta.length()*5/K;
			console.log("attractive :"+mag);
			delta = delta.unit();
			delta.x *= mag;
			delta.y *= mag;
			//v.disp = v.disp.subtract(delta);
			//u.disp = u.disp.add(delta);
		}

		for(var j=0; j<cities.length; j++){
			//cities[j].disp = cities[j].disp.unit()
			cities[j].sprite.x += cities[j].disp.x;
			cities[j].sprite.y += cities[j].disp.y;
			cities[j].sprite.x = Math.min(924, Math.max(0, cities[j].sprite.x));
			cities[j].sprite.y = Math.min(568, Math.max(0, cities[j].sprite.y));
		}
	}

	//
	cities[0].machine.status = "found";
	cities[0].sprite.visible=true;

	for(var i=0; i<this.graph.paths.length; i++){
		var a = getCityById(getServiceById(this.graph.paths[i].src).machineID)
		if(a!=null) a=a.sprite;
		var b = getCityById(getServiceById(this.graph.paths[i].dest).machineID).sprite;
		if(b!=null) b=b.sprite;
		if(a!=null && b!=null && a.visible==true && b.visible==true){
			var g = createjs.Graphics;
			var road = new g().beginStroke("#FFFFFF").moveTo(a.x, a.y).lineTo(b.x, b.y).endStroke();
			var shape = new createjs.Shape(road);
			layer.addChild(shape);
		}
	}

	return cities
}
