/* global EffectMaster */
EffectMaster={}

EffectMaster.Explode = function(parent,x,y,time,distance,n,side,radius){
	x = x || 512
	y = y || 384
	n = n || 20;
	distance = distance || 100
	side = side || 5
	radius = radius || 10;
	time = time || 1000;
	var star = [];
	for(i=0; i<n; i++){
		star[i] = new createjs.Shape()
		star[i].graphics.f("yellow").dp(0,0,radius,side,0.4,Math.random()*360)
		parent.addChild(star[i])
		star[i].x = x
		star[i].y = y
		createjs.Tween.get(star[i])
			.to(
				{
					"x":star[i].x+Math.random()*distance-(distance/2), 
					"y":star[i].y+Math.random()*distance-(distance/2),
					"rotation":Math.random()*360,
					"alpha": 0
				},
				time
			)
			.call(function(e){parent.removeChild(e.target)})
	}
}

EffectMaster.addButtonEffect = function(btn){
	btn.on("mouseover", EffectMaster.scaleUp, btn);
	btn.on("mouseout", EffectMaster.scaleDown, btn);
}

EffectMaster.scaleUp = function(e){
	createjs.Tween.get(e.target)
		.to({"scaleX":1.1, "scaleY":1.1}, 400, createjs.Ease.backOut);
	createjs.Sound.play("hover-sfx");
}

EffectMaster.scaleDown = function(e){
	createjs.Tween.get(e.target)
		.to({"scaleX":1, "scaleY":1}, 400, createjs.Ease.backIn);
}