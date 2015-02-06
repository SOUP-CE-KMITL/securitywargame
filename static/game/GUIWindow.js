WindowManager = {};
WindowManager.Windows = [];
WindowManager.Init = function(){

}

WindowManager.NewWindow = function(parent,x,y,w,h){
	var win = new GUIWindow(parent, x, y, w, h);
	WindowManager.Windows.push(win);
	win.winID = WindowManager.Windows.length-1;
	return win;
}

function GUIWindow(parent, x, y, w, h){
	this.parent = parent;
	var g = new createjs.Graphics();
	g.s("#000000").f("#EEEEEE").r(0,0,w,h).ef().es();
	this.bg = new createjs.Shape(g);
	g = new createjs.Graphics();
	g.f("#000").r(-x,-y,1024,768).ef();
	this.block = new createjs.Shape(g);
	this.block.alpha = 0.5;
	this.winGroup = new createjs.Container();
	this.winGroup.addChild(this.block);
	this.winGroup.addChild(this.bg);
	parent.addChild(this.winGroup);
	this.items = [];
	this.winGroup.x = x;
	this.winGroup.y = y;
	this.block.on("click", function(e){
		this.RemoveWindow()
	}, this);
}

GUIWindow.prototype.RemoveWindow=function(){
	this.parent.removeChild(this.winGroup)
	delete this;
}
GUIWindow.prototype.NewLabel=function(msg,x,y){
	var l = new createjs.Text(msg, "18px arial", "#000000");
	l.x = x;
	l.y = y;
	l.textAlign = "center";
	this.items.push(l);
	this.winGroup.addChild(l);
}

GUIWindow.prototype.NewButton=function(label, x, y, w, h, callback){
	var b = new createjs.Container();
	var g = new createjs.Graphics();
	g.s("#000").f("#EEE").r(0,0,w,h).ef().es();
	g = new createjs.Shape(g);
	b.addChild(g);
	var l = new createjs.Text(label, "18px arial", "#000000");
	l.textAlign = "center";
	l.textBaseline = "middle";
	l.x = w/2;
	l.y = h/2;
	b.addChild(l);
	b.x = x;
	b.y = y;
	b.l = l;
	b.g = g;
	this.winGroup.addChild(b);
	b.addEventListener("click", callback);
	b.on("mouseover", function(e){
		g.graphics.clear().s("#000").f("#CCC").r(0,0,w,h).ef().es();
	}, b)
	b.on("mouseout", function(e){
		g.graphics.clear().s("#000").f("#EEE").r(0,0,w,h).ef().es();
	}, b)
	this.items.push(b);
}

GUIWindow.prototype.NewImgButton=function(img, x, y, clickHandler, scope){
	var g = new createjs.Bitmap(img);
	g.x = x;
	g.y = y;
	g.regX = 32;
	g.regY = 32;
	console.log(g.regX + " , " + g.regY);
	g.on("click", clickHandler, scope);
	g.on("mouseover", function(){
		createjs.Tween.removeTweens(g);
		g.scaleX = 1;
		g.scaleY = 1;
		createjs.Tween.get(g).to({"scaleX":1.1, "scaleY":1.1}, 300, createjs.Ease.backOut);
	})
	g.on("mouseout", function(){
		createjs.Tween.removeTweens(g);
		createjs.Tween.get(g).to({"scaleX":1, "scaleY":1}, 300, createjs.Ease.backOut);
	})
	this.winGroup.addChild(g);
	this.items.push(g);
}