
QueueList = {};

QueueList.Init = function(parent){
	QueueList.container = new createjs.Container();
	QueueList.names = [];
	QueueList.remTurns = [];
	var g = new createjs.Graphics();
	g.f("rgba(0,0,0,0.5)").rr(0, 0, 130, 400, 15).ef();
	QueueList.container.addChild(new createjs.Shape(g));
	QueueList.container.y = 100;
	QueueList.container.x = -100;
	parent.addChild(QueueList.container);

	QueueList.container.on("mouseover", function(){
		createjs.Tween.get(QueueList.container)
			.to({"x":0}, 200);
	}, this);

	QueueList.container.on("mouseout", function(){
		createjs.Tween.get(QueueList.container)
			.to({"x":-100}, 200);
	}, this);
}

QueueList.Add = function(text, turn){
	var msg = new createjs.Text(text, "18px arial", "#FFFFFF");
	QueueList.names.push(msg);
	QueueList.container.addChild(msg);

	var num = new createjs.Text(turn, "18px arial", "#FFFFFF");
	num.x = 100;
	QueueList.remTurns.push(num);
	QueueList.container.addChild(num);

	var a=false;
	for(var i=0; i<QueueList.names.length; i++){
		if(QueueList.remTurns[i].text==turn && !a){
			msg.y=30*i;
			num.y=30*i;
			a=true;
		}else if(parseInt(QueueList.remTurns[i].text, 10)>=turn && a){
			QueueList.names[i].y += 30;
			QueueList.remTurns[i].y += 30;
		}
	}
}

QueueList.Remove = function(index){
	for(var i=0; i<QueueList.names.length; i++){
		if(index==null){
			if(QueueList.remTurns[i].text==0){
				QueueList.container.removeChild(QueueList.names[i]);
				QueueList.container.removeChild(QueueList.remTurns[i]);
				for(var j=i; j<QueueList.names.length; j++){
					QueueList.names[j].y -= 30;
					QueueList.remTurns[j].y -= 30;
				}
				QueueList.remTurns.splice(i,1);
				QueueList.names.splice(i,1);
				i=i-1;
			}
		}
	}
}