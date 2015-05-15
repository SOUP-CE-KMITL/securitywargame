var EndScene = {
	scene: null,
	
	load:function(params){
		SceneManager.currentScene = this
		
		this.scene = new createjs.Container();
		//play bgm
		createjs.Sound.play("end-bgm", {"loop":-1});
	
		var bg = new createjs.Shape()
		bg.graphics.f("#000").r(0,0,1024,768);
		this.scene.addChild(bg)
	
		//fake value for testing
		//SceneManager.params = SceneManager.params || 2
		//PlayScene.score = PlayScene.score || 30
		
		//get high score
		var response = callAPI("GET","/get-highscore?map_id="+params.mapID);
		var scoreList = JSON.parse(response)
	
		//draw game over text
		var over = new createjs.Text(params.reason, "48px arial", "#6FE")
		over.x = 512
		over.y = 50
		over.textAlign = "center"
		this.scene.addChild(over)
	
		//draw score list
		for(var i=0; i<scoreList.length; i++){
			var score = new createjs.Text(scoreList[i], "28px arial", "#FFF")
			score.x = 512
			score.y = 140+40*i
			score.textAlign = "center"
			this.scene.addChild(score)
		}
	
		//draw player score
		var myScore = new createjs.Text(PlayScene.score, "36px arial", "#CA4")
		myScore.x = 512
		myScore.y = 530
		myScore.textAlign = "center"
		this.scene.addChild(myScore);
	
		//draw replay button
		var btn = new createjs.Shape()
		btn.graphics
			.s("#555")
			.f("#DDD")
			.r(-50, -30, 100, 60)
			.ss(3)
			.s("#333")
			.a(0,0,20, Math.PI*0.75, Math.PI*0.25)
			.mt(-14, 14)
			.f("#333")
			.dc(-13, 14, 2)
			.dp(14, 14, 5, 3, 0, 135)
		btn.x = 512
		btn.y = 630
		this.scene.addChild(btn)
	
		btn.on("click", function(){
			SceneManager.changeScene(LevelScene);
		}, this)
		//fx
		var myText = [
			"s o E C B Y r k , m D C J c v ; 2 ) L 3 ' l ; v d e a c [ q w e 4 D v 4 * 5 c D",
			"z w p e j k ; O J A ; L K J J ; L K i o j l c q [ 9 0 . m n v i S ^ r e N I ( 0",
			"8 c k e m c e L D N } C + D _ E < l l e k v k r . v 5 8 f I K E k c i K E 9 3 4",
			"f s l D V $ 5 6 k k 2 3 4 f 7 % o i S ^ r e N I ( 0 p o h ^ I G p h I H N l Z W",
			"S S B h b S B 0 a G U g Y m V z d C B w c m 9 n c m F t b W V y E C B Y r k , 9",
			"V G h ? c y B n Y W 1 l I G l z I G Z 1 Y 2 t p b m c g a G F y Z C 4 = ^ x K d",
			"a 3 V 5 ^ I G p h I H N l Z C ( B t a G * k  g b m  V l c g # % W h y a m i d o",
			"W h y I a m k e e p d o i n g t h i s ! @ # $ % ^ & * ( ) 3 s h o u l e n u f ?"
		]
		var matrixFX = []
		for(var i=0; i<100; i++){
			matrixFX[i] = new createjs.Text(myText[Math.floor(Math.random()*(myText.length+1))], "4px arial", createjs.Graphics.getRGB(0,Math.floor(180+Math.random()*75),Math.floor(Math.random()*50)))
			matrixFX[i].lineWidth = 8
			matrixFX[i].textAlign = "center"
			matrixFX[i].y = 758
			matrixFX[i].x = i%2==0?Math.random()*300-30:700+Math.random()*324
			this.scene.addChild(matrixFX[i])
			var tweenObj = createjs.Tween.get(matrixFX[i], {"loop":true})
				.to({"y":-200}, Math.floor(10000+Math.random()*5000))
			tweenObj.addEventListener("change", function(e){
				e.target.target.text = myText[Math.floor(Math.random()*myText.length)]
			})
		}
	
		stage.addChild(this.scene)
	},
	
	erase:function(stage){
		stage.removeChild(this.scene);
	}
	
	
}