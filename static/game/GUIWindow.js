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
	var g = new createjs.Graphics();
	g.s("#000000").f("#EEEEEE").r(0,0,w,h).ef().es();
	this.bg = new createjs.Shape(g);
	this.winGroup = new createjs.Container();
	this.winGroup.addChild(this.bg);
	parent.addChild(this.winGroup);
	this.items = [];
	this.winGroup.x = x;
	this.winGroup.y = y;
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
	g.s("#00000").f("#1111BB").r(0,0,w,h).ef().es();
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
	this.winGroup.addChild(b);
	b.addEventListener("click", callback);
	this.items.push(b);
}