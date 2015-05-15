/* global callAPI */
/* global createjs */
var LevelScene = {
	scene: null,
	mapList: null,
	load: function(params){
		//get map list
		var response = callAPI("GET", "/maplist")
		this.mapList = JSON.parse(response);
		//set up scene
		this.scene = new createjs.Container();
		
		//play bgm
		createjs.Sound.play("level-bgm", {"loop":-1});
		
		//draw headline
		var headline = new createjs.Text("MAP SELECT", "36px arial", "#FFF");
		headline.textAlign = "center";
		headline.x = 512;
		this.scene.addChild(headline);
		
		//btn handler
		function clickHandler(){
			createjs.Sound.play("click-sfx");
			SceneManager.changeScene(PlayScene, {mapID:this.urlsafekey})
		}
		function overHandler(){
			createjs.Sound.play("hover-sfx")
			this.bbg.graphics.clear().s('#6DEAFF').f("#C8F8FF").r(-500,-15,1000,30).ef().es();		
		} 
		function outHandler(){
			this.bbg.graphics.clear().s("#6DEAFF").f("#008CA4").r(-500,-15,1000,30).ef().es();
		}
		
		//draw level buttons.
		var btn = [];
		for(var i=0; i<this.mapList.length; i++){
			btn[i] = new createjs.Container();
			btn[i].bbg = new createjs.Shape();
			btn[i].bbg.graphics.clear().s('#6DEAFF').f("#008CA4").r(-500,-15,1000,30).ef().es();
			btn[i].addChild(btn[i].bbg);
			var label = new createjs.Text(this.mapList[i].name, "18px arial", "#FFF");
			btn[i].urlsafekey = this.mapList[i].key;
			label.textAlign = "center";
			label.y = -10
			btn[i].addChild(label);
			btn[i].x = 512;
			btn[i].y = 60+i*40;
			btn[i].on("click", clickHandler, btn[i]);
			btn[i].on("mouseover", overHandler, btn[i]);
			btn[i].on("mouseout", outHandler, btn[i])
			this.scene.addChild(btn[i]);
		}
		stage.addChild(this.scene);
		SceneManager.currentScene = this;
	},
	erase: function(stage){
		stage.removeChild(this.scene);
	}
}