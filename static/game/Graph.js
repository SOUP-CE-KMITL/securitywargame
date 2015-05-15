function Graph(g){
	this.machines = g.machines;
	this.services = g.services;
	this.paths = g.paths;
	this._mDict = [];
	this._sDict = [];
	this._pDict = [];
	
	for(var i=0; i<g.machines.length; i++){
		var m = g.machines[i]
		this._mDict[m.machineID] = m;
	}
	
	for(var i=0; i<g.services.length; i++){
		var s = g.services[i]
		this._sDict[s.serviceID] = s;
		s.impact = s.impact || {"a":0, "c":0, "i":0}
	}
	
	for(var i=0; i<g.paths.length; i++){
		var p = g.paths[i]
		this._mDict[p.pathID] = p;
	}
	
	this._sDict[0] = {"serviceID":0, "name":"os", "machineID":0, "captured":true}
}