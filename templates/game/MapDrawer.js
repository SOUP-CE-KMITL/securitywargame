
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
		cities[i].Draw(layer, 64*Math.cos(i*2.02)+512, 64*Math.sin(i*2.02)+384);
	}
	PlayScene.cities = cities;

	//Draw with Force-directed algorithm. 
	//Do iterations. Mostly 100 times is enough.
	for(var i=0; i<100; i++){
		//calculat repulsive force
		for(var j=0; j<cities.length; j++){
			cities[j].disp = new Vector(0,0);
			for(var k=0; k<cities.length; k++){
				//if city[j] connect city[k]
				if(cities[j].IsConnect(cities[k])){
					//Attractive
					var x = cities[j].sprite.x - cities[k].sprite.x;
					var y = cities[j].sprite.y - cities[k].sprite.y;
					var delta = new Vector(x,y);
					cities[j].sprite.x -= delta.x*2/3;
					cities[j].sprite.y -= delta.y/4;
					cities[k].sprite.x += delta.x*2/3;
					cities[k].sprite.y += delta.y/4;
					//console.log("pair: "+cities[j].name+" - "+cities[k].name+", dif.x: "+delta.x+", dif.y: "+delta.y);
				}

				//Repulsive
				var u = cities[j];
				var v = cities[k];
				var x = v.sprite.x - u.sprite.x
				var y = v.sprite.y - u.sprite.y
				x = (x<1 && x>0)? 1: (x>-1 && x<0)? -1: x;
				y = (y<1 && y>0)? 1: (y>-1 && y<0)? -1: y;
				if(x!=0){
					cities[j].sprite.x -= 192/x;
					cities[k].sprite.x += 192/x;
				}
				if(y!=0){
					cities[j].sprite.y -= 144/y;
					cities[k].sprite.y += 144/y;
				}
			}
		}
	}
	var sx=sy=0;
	for(var j=0; j<cities.length; j++){
		sx += cities[j].sprite.x
		sy += cities[j].sprite.y
	}
	sx /= cities.length;
	sy /= cities.length;
	var dx = sx-512;
	var dy = sy-324;
	console.log(dx+" "+dy);
	for(var j=0; j<cities.length; j++){
		cities[j].sprite.x -= dx;
		cities[j].sprite.y -= dy;
		cities[j].sprite.x = Math.max(50, Math.min(cities[j].sprite.x, 950));
		cities[j].sprite.y = Math.max(100, Math.min(cities[j].sprite.y, 684));
	}
	

	//

	for(var i=0; i<cities.length; i++){
		var a = cities[i];
		for(var j=0; j<a.to.length; j++){
			var b = getCityById(a.to[j]);
			sa = a.sprite;
			sb = b.sprite;
			if(sa.visible && sb.visible){
				var g = createjs.Graphics;
				var road = new g().beginStroke("#FFFFFF").moveTo(sa.x, sa.y).lineTo(sb.x, sb.y).endStroke();
				var shape = new createjs.Shape(road);
				layer.addChild(shape);
			}
		}
	}

	layer.addEventListener("mousedown", function(evt){
		evt.currentTarget.px = evt.localX;
		evt.currentTarget.py = evt.localY;
	});
	layer.addEventListener("pressmove", function (evt) {
    evt.currentTarget.set({
        x: evt.stageX-evt.currentTarget.px,
        y: evt.stageY-evt.currentTarget.py
    });
	});

	return cities
}
