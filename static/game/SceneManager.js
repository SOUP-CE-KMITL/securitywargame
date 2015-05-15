/* global stage */
var SceneManager = {
	currentScene: null,
	changeScene:function(toScene, params){
		if(this.currentScene){
			this.currentScene.erase(stage);
			createjs.Sound.stop();
		}
		toScene.load(params);
		this.currentScene = toScene;
	}
}