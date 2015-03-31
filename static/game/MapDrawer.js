
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
		p.keyHeld = 0;
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
		cities[i].Draw(layer, 244+(FILL_POSITION[i]%4)*172, 105+Math.floor(FILL_POSITION[i]/4)*112);
	}
	PlayScene.cities = cities;

	//Draw with Force-directed algorithm. 
	//Do iterations. Mostly 100 times is enough.
	for(var i=0; i<100; i++){
		for(var j=0; j<cities.length; j++){
			for(var k=0; k<cities.length; k++){
				var n1 = cities[j].sprite
				var n2 = cities[k].sprite
				var d0 = new Vector(n2.x-n1.x, n2.y-n1.y)
				var di
				if(cities[j].IsConnect(cities[k])){
					//Distance should be 80
					di = d0.unit().multiply(80)
				}else{
					di = d0.unit().multiply(120)
				}
				var d1 = d0.divide(3).subtract(di)
				n1.x += d1.x
				n1.y += d1.y
			}
		}
	}
	//adjust to center
	var sx=sy=0;
	for(var j=0; j<cities.length; j++){
		sx += cities[j].sprite.x
		sy += cities[j].sprite.y
	}
	sx /= cities.length;
	sy /= cities.length;
	var dx = sx-512;
	var dy = sy-324;
	for(var j=0; j<cities.length; j++){
		cities[j].sprite.x -= dx;
		cities[j].sprite.y -= dy;
		cities[j].sprite.x = Math.max(50, Math.min(cities[j].sprite.x, 950));
		cities[j].sprite.y = Math.max(100, Math.min(cities[j].sprite.y, 684));
	}
	

	//draw road
	for(var i=0; i<cities.length; i++){
		cities[i].DrawLink()
	}

	layer.addEventListener("mousedown", function(evt){
		evt.currentTarget.px = evt.localX;
		evt.currentTarget.py = evt.localY;
	});
	
	/*
	layer.addEventListener("pressmove", function (evt) {
    evt.currentTarget.set({
        x: Math.max(0, Math.min(1024-evt.currentTarget.width, evt.stageX-evt.currentTarget.px)),
        y: Math.max(0, Math.min(768-evt.currentTarget.height, evt.stageY-evt.currentTarget.py))
    });
	});
	*/

	return cities
}
