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
	console.log("n:"+n)
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