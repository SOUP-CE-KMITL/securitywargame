////////////////////////
//****** GLOBAL ******//
////////////////////////
var SCORE_SYSTEM = {
	//accessibility
	"av": [100, 64, 39, 39],
	"ac": [35, 61, 71, 71],
	"au": [45, 56, 70, 70],

	//impact
	"ci": [0, 27, 66],
	"ii": [0, 27, 66],
	"ai": [0, 27, 66]
}

var SERVICE_DICT = {
	"os": "Headquater",
	"db": "Warehouse",
	"mysql": "Warehouse",
	"web": "Tradeport",
	"www": "Tradeport",
	"http": "Tradeport",
	"https": "Tradeport",
	"ssh": "Barrack",
	"firewall": "Turret",
	"fw": "Turret",
	"ftp": "Barrack"
}

var CWE_DICT = {
	"bypass": "Hunter",
	"injection": "Hypnotist",
	"what": "Arai"
}

var RANDOM_NAME = [
	"Spc.Peter",
	"Spc.Sean",
	"Spc.David",
	"Spc.Micheal",
	"Spc.John",
	"Spc.Johny",
	"Spc.Dave",
	"Spc.Leo",
	"Spc.Bobby",
	"Spc.Justin",
	"Spc.Jaden",
	"Spc.Jeff",
	"Spc.Mike",
	"Spc.Mark",
	"Spc.Albert",
	"Spc.Stephen",
	"Spc.Jonathan",
	"Spc.Robert",
	"Spc.Steve",
	"Spc.Garfield",
	"Spc.Jenny"
]

var RANDOM_CITY = [
	"St.James","Cyro","Rome","Brookhaven","Black Butte Ranch",
	"Crosbyton","Cedar Vale","Gnadenhutten","Ash Shu‘aybah",
	"‘Atf Jabara","Aushaziya","Daff Khuzā‘ah","Ras at Tannura",
	"Heesfeld", "Oelixdorf", "Gehrenrode","Tressentin","Buoch"
]

var FILL_POSITION = [10,9,7,12,4,15,6,13,14,5,8,11,16,17,3,2,1,0,19,18]

/* global stage */
function callAPI(method, url, params){
	var xmlhttp;
	if (window.XMLHttpRequest){
	  xmlhttp=new XMLHttpRequest();
	}else{
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open(method,url,false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	if(method == "POST"){
		xmlhttp.send(params);
	}else{
		xmlhttp.send();	
	}
	return xmlhttp.responseText
}

function drawBitMap(parent, img, x, y, regX, regY){
	var bit = new createjs.Bitmap(img);
	bit.x = x;
	bit.y = y;
	bit.regX = regX;
	bit.regY = regY;
	parent.addChild(bit);
}
