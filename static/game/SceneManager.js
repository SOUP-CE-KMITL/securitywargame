
function SceneManager(stage){
	this.scenes={
		"home": new HomeScene(),
		"play": new PlayScene(),
		"level": new LevelScene(),
		"end": new EndScene()
	};
	this.currentScene = null;
	this.stage = stage;
}

SceneManager.prototype.ChangeScene=function(dest, effect, dur){
	var newScene = this.scenes[dest];
	
	if(newScene.inited == false) 
		newScene.Init();

	if(effect==null){
		if(this.currentScene!=null){
			this.currentScene.Hide(this.stage);
		}
		newScene.Show(this.stage);
		this.currentScene = newScene;
	}
}

function HomeScene(){}

function LevelScene(){}

function EndScene(){}