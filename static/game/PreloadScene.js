/* global LevelScene */
/* global SceneManager */
/* global createjs */
/* global myItems */
var PreloadScene = {
	scene: null,
	load:function(){
		this.scene = new createjs.Container();
		
		//progress bar
		var bar = new createjs.Shape();
		this.scene.addChild(bar);
		bar.graphics
			.f("green")
			.r(412, 300, 0, 30)
			
		var bar2 = new createjs.Shape();
		bar2.graphics
			.f("yellow")
			.r(412, 450, 0, 30)
		
		myItems = {}	//store preloaded item
		//preload the game
		var queue = new createjs.LoadQueue();
		createjs.Sound.alternateExtensions = ["mp3"];
		queue.installPlugin(createjs.Sound);
		queue.loadManifest([
			{"src": "resource/bg/bg-city.png", "id": "bg-city"},
			{"src": "resource/bg/bg-grass.png", "id":"bg-grass"},
			{"src": "resource/bg/bg-mountain1.png", "id":"bg-mt1"},
			{"src": "resource/bg/bg-mountain2.png", "id":"bg-mt2"},
			{"src": "resource/bg/help2.png", "id":"help"},
			{"src": "resource/char/char-city.png", "id":"char-city"},
			{"src": "resource/char/char-flag.png", "id":"char-flag"},
			{"src": "resource/char/char-scout.png", "id":"char-scout"},
			{"src": "resource/char/char-sol1.png", "id":"char-sol1"},
			{"src": "resource/char/char-tank.png", "id":"char-tank"},
			{"src": "resource/sfx/FiveArmies.mp3", "id":"level-bgm", "data":1},
			{"src": "resource/sfx/Hitman.mp3", "id":"play-bgm", "data":1},
			{"src": "resource/sfx/DeepHaze.mp3", "id":"end-bgm", "data":1},
			{"src": "resource/sfx/click.mp3", "id":"click-sfx"},
			{"src": "resource/sfx/hover.mp3", "id":"hover-sfx"},
			{"src": "resource/sfx/begin.wav", "id":"start-sfx"},
			{"src": "resource/sfx/complete.wav", "id":"end-sfx"}
		], "/static/game/");
		
		//LoadQueue handler
		//update progress bar when loaded some item.
		queue.on("progress", function(e){
			bar.graphics
				.clear()
				.f("green")
				.r(412, 300, 200*e.loaded, 30)
		}, this);
		queue.on("fileload", function(e){
			myItems[e.item.id] = e.result;
		}, this)
		queue.on("complete", function(e){
			SceneManager.changeScene(LevelScene, null);
		}, this)
		
		stage.addChild(this.scene);
		SceneManager.currentScene = this;
	},
	erase:function(parent){
		parent.removeChild(this.scene);
	}
}