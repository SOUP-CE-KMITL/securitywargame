#ADD TEST USER
Method : GET<br/>
Url : /create-dummy-user
Parameter : 
user_id -> int(required)
username -> string

Result should look like this
http://puu.sh/cZgRy/c1b4e67480.jpg

#LOGIN TEST USER
Method : GET
Url : /bypass-login
Parameter :
user_id -> int(required)

Result should look like this
http://puu.sh/cZgOx/2eac4598e4.jpg

#UI Graph-> CRETAE -> EDIT -> GET

create graph using url => /create-graph full path-> http://cyber-security-war-game.appspot.com/create-graph

edit graph using url => /edit-graph?id=[graphID] you may need to refresh after add new Machine or Service for silly select ID box

get graph using url => /get-graph?id=[graphID] return object dict as json format

Post JSON Body -> /postGraph
Example Test Data:

{ 
	"name" : "testGraph1"
	"machines": [{ "machineID" : 1, "name": "m_name1", "status" : "m_status1", "impact" : "1" },{ "machineID" : 1, "name": "m_name2", "status" : "m_status2", "impact" : "2" }],
	"services" : [{ "serviceID": 1, "name": "s_name1", "status": "s_status1", "impact" : "1", "machineID": 1}, 
	{ "serviceID": "2", "name": "s_name2", "status": "s_status2", "impact" : "2", "machineID": "2"}]
	"paths" : [{ "pathID" : "1" , "name" : "path_1", "status" : "p_stat", "src" : "1", "dest" : "2", "av": "1", "ac" : "1", "au": "1", "ci": "1", "ii" : "1", "ai" : "1"},
	{ "pathID" : "2", "name" : "path_2", "status" : "p_stat2", "src" : "1", "dest" : "2", "av": "1", "ac" : "1", "au": "1", "ci": "1", "ii" : "1", "ai" : "1" }]
}

Result:
http://puu.sh/cTgEe/8f7c3c0869.jpg

Test Via PostMan
