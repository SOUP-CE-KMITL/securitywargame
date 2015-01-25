### api key is needed when adding new graph ###
get one from /api (afte register new admin account)

example : http://puu.sh/eZJVP/0dfd8405af.jpg

### user : { player -> ('/'), admin -> ('/admin') }
player will be force to login with their facebook account to play game.
admin need to be regis for a new one. to access graph management dashboard.

http://puu.sh/eSa1V/b7c0fe1939.jpg

### renovate all user's tools and report document

#ADD TEST USER
Method : GET<br/>
Url : /create-dummy-user<br/>
Parameter : <br/>
user_id -> int(required)<br/>
username -> string<br/>

Result should look like this<br/>
http://puu.sh/cZgRy/c1b4e67480.jpg

#LOGIN TEST USER
Method : GET<br/>
Url : /bypass-login<br/>
Parameter :<br/>
user_id -> int(required)<br/>

Result should look like this<br/>
http://puu.sh/cZgOx/2eac4598e4.jpg

#UI Graph-> CRETAE -> EDIT -> GET

create graph using <br/>
url => /create-graph full path-> http://cyber-security-war-game.appspot.com/create-graph

edit graph using <br/>
url => /edit-graph?id=[graphID] you may need to refresh after add new Machine or Service for silly select ID box

get graph using url => /get-graph?id=[graphID] return object dict as json format

Post JSON Body -> /postGraph<br/>
Example Test Data:<br/>
<br/>
{ <br/>
	"name" : "testGraph1"<br/>
	"machines": [{ "machineID" : 1, "name": "m_name1", "status" : "m_status1", "impact" : "1" },{ "machineID" : 1,<br/> "name": "m_name2", "status" : "m_status2", "impact" : "2" }],<br/>
	"services" : [{ "serviceID": 1, "name": "s_name1", "status": "s_status1", "impact" : "1", "machineID": 1}, <br/>
	{ "serviceID": "2", "name": "s_name2", "status": "s_status2", "impact" : "2", "machineID": "2"}]<br/>
	"paths" : [{ "pathID" : "1" , "name" : "path_1", "status" : "p_stat", "src" : "1", "dest" : "2", "av": "1", "ac" :<br/> "1", "au": "1", "ci": "1", "ii" : "1", "ai" : "1"},<br/>
	{ "pathID" : "2", "name" : "path_2", "status" : "p_stat2", "src" : "1", "dest" : "2", "av": "1", "ac" : "1", "au":<br/> "1", "ci": "1", "ii" : "1", "ai" : "1" }]<br/>
}<br/>

Result:<br/>
http://puu.sh/cTgEe/8f7c3c0869.jpg<br/>

Test Via PostMan
