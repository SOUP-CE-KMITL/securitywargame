
SceneManager = {};

Jukebox = {
	"sounds":[],
	"playQueue":[],
	"instances":{}
};

Jukebox.play = function(id, loop, channel){

	if(Jukebox.instances[id]){ //play with instance if it's already have.
		Jukebox.instances[id].play({"loop":loop})
	}else if(Jukebox.sounds[id]){ //or play with loaded sound
		createjs.Sound.play(id, {"loop":loop})
	}else{ //or wait til finished loading
		for(var i=0; i<Jukebox.playQueue.length; i++){
			if(Jukebox.playQueue[i][1]==channel){
				Jukebox.playQueue.splice(i,1)
				i--
			}
		}
		Jukebox.playQueue.push([id, channel, loop])
	}
}

SceneManager.SetUp=function(stage){
	this.scenes={
		"home": new HomeScene(),
		"play": new PlayScene(),
		"level": new LevelScene(),
		"end": new EndScene()
	};
	this.currentScene = null;
	this.stage = stage;

	//Sound Set up
	var sounds = [
		{"src":"Hitman.mp3", "id":"play-bgm", "data":1},
		{"src":"Five Armies.mp3", "id":"level-bgm", "data":1},
		{"src":"Deep Haze.mp3", "id":"end-bgm", "data":1},
		{"src":"hover.mp3", "id":"hover-sfx", "data":2},
		{"src":"click.mp3", "id":"click-sfx", "data":2},
		{"src":"complete.wav", "id":"success-sfx", "data":3},
		{"src":"triple-shot.ogg", "id":"fail-sfx", "data":3},
		{"src":"begin.wav", "id":"mission-sfx", "data":3}
	]
	createjs.Sound.alternateExtensions = ["mp3"];
 	createjs.Sound.on("fileload", handleLoad); // add an event listener for when load is completed
 	createjs.Sound.registerSounds(sounds, "/static/game/resource/sfx/");
}

function handleLoad(e){
	Jukebox.sounds[e.id] = true
	for(var i=0; i<Jukebox.playQueue.length; i++){
		if(Jukebox.playQueue[i][0] == e.id){
			createjs.Sound.play(e.id, {"loop":Jukebox.playQueue[i][2]})
			Jukebox.playQueue.splice(i,1)
			i--
		}
	}
}

SceneManager.ChangeScene=function(dest, effect, dur){

	console.log("ChangeScene...")
	if(effect==null){
		if(this.currentScene!=null){
			createjs.Sound.stop()
			this.currentScene.Hide(SceneManager.stage);
		}
	}

	var newScene = this.scenes[dest];
	
	if(!newScene.inited) 
		newScene.Init();
}

function HomeScene(){}

function LevelScene(){
	this.inited=false;
}

LevelScene.prototype.Init=function(){
	this.inited=true;
	this.scene = new createjs.Container();
	this.Show(SceneManager.stage);
}
LevelScene.prototype.Show=function(stage){
	
	SceneManager.currentScene = this
	stage.addChild(this.scene);
	
	Jukebox.play("level-bgm", -1)
	var xmlhttp;
	if (window.XMLHttpRequest){
	  xmlhttp=new XMLHttpRequest();
	}else{
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("GET","/maplist?player=john",false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send();
	var maplist = JSON.parse(xmlhttp.responseText);

	var headline = new createjs.Text("MAP SELECT", "36px arial", "#FFF");
	headline.textAlign = "center";
	headline.x = 512;
	this.scene.addChild(headline);
	var btn = [];

	for(var i=0; i<maplist.length; i++){
		btn[i] = new createjs.Container();
		btn[i].bbg = new createjs.Shape();
		btn[i].bbg.graphics.clear().s('#6DEAFF').f("#008CA4").r(-500,-15,1000,30).ef().es();
		btn[i].addChild(btn[i].bbg);
		var label = new createjs.Text(maplist[i].name, "18px arial", "#FFF");
		btn[i].urlsafekey = maplist[i].key;
		label.textAlign = "center";
		label.y = -10
		btn[i].addChild(label);
		btn[i].x = 512;
		btn[i].y = 60+i*40;
		btn[i].on("click", function(){
			SceneManager.params= this.urlsafekey;
			SceneManager.ChangeScene("play")
		}, btn[i]);
		btn[i].on("mouseover", function(){
			this.bbg.graphics.clear().s('#6DEAFF').f("#C8F8FF").r(-500,-15,1000,30).ef().es();
		}, btn[i]);
		btn[i].on("mouseout", function(){
			this.bbg.graphics.clear().s("#6DEAFF").f("#008CA4").r(-500,-15,1000,30).ef().es();
		}, btn[i])
		this.scene.addChild(btn[i]);
	}
}
LevelScene.prototype.Hide=function(stage){
	stage.removeChild(this.scene);
}

function EndScene(){}
EndScene.prototype.Init=function(){
	this.scene = new createjs.Container();
	this.Show(SceneManager.stage);
}
EndScene.prototype.Show=function(stage){
	SceneManager.currentScene = this

	//play bgm
	Jukebox.play("end-bgm")

	var bg = new createjs.Shape()
	bg.graphics.f("#000").r(0,0,1024,768);
	this.scene.addChild(bg)

	//fake value for testing
	SceneManager.params = SceneManager.params || 2
	PlayScene.score = PlayScene.score || 30
	
	//get high score
	var req;
	if (window.XMLHttpRequest){
	  req=new XMLHttpRequest();
	}else{
	  req=new ActiveXObject("Microsoft.XMLHTTP");
	}
	req.open("GET","/get-highscore?map_id="+SceneManager.params,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	req.send();
	var scoreList = JSON.parse(req.responseText)

	//draw game over text
	var over = new createjs.Text("GAME OVER", "48px arial", "#6FE")
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
	myScore.y = 500
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
	btn.y = 600
	this.scene.addChild(btn)

	btn.on("click", function(){
		SceneManager.ChangeScene("level")
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
		//if(i%5==0){
			tweenObj.addEventListener("change", function(e){
				e.target.target.text = myText[Math.floor(Math.random()*myText.length)]
			})
		//}
	}

	stage.addChild(this.scene)
}
EndScene.prototype.Hide=function(stage){
	stage.removeChild(this.scene)
}