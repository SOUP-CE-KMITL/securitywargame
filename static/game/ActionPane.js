
ActionPane={}

ActionPane.Init=function(parent){
	ActionPane.container = new createjs.Container();
	ActionPane.actions = new Array();
	parent.addChild(ActionPane.container);
	return ActionPane.container;
}

ActionPane.SetActions=function(set){
	ActionPane.container.removeAllChildren();
	for(var i=0; i<set.length; i++){
		ActionPane.actions[i] = {}
		ActionPane.actions[i].img = new createjs.Bitmap(set[i].img);
		if(set[i].soldier.name=="explorer"){
			ActionPane.actions[i].img.addEventListener("mouseover", Explorer.ShowInfo);
			ActionPane.actions[i].img.addEventListener("click", Explorer.Action);
		}else{
			ActionPane.actions[i].img.addEventListener("mouseover", Soldier.ShowInfo);
			ActionPane.actions[i].img.addEventListener("click", Soldier.Action);
		}
		ActionPane.actions[i].img.x = 700+(i%4)*72;
		ActionPane.actions[i].img.y = 620+(Math.floor(i/4))*72;
		ActionPane.actions[i].img.ref = set[i].soldier;
		ActionPane.container.addChild(ActionPane.actions[i].img);
	}
}
