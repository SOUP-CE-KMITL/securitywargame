from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import ndb
from helpers import *

def valid_pw(name, password, h):
	salt = h.split(',')[0]
	return h == make_pw_hash(name, password, salt)

class CVEProfile(ndb.Model):
	profile_name = ndb.StringProperty(default="N/A")
	cve_id = ndb.StringProperty(required=True)
	cwe_id = ndb.StringProperty(required=True)
	cwe_name = ndb.StringProperty(required=True)
	summary = ndb.TextProperty()
	cvss_score = ndb.FloatProperty()
	exploit_count = ndb.IntegerProperty()
	publish_date = ndb.StringProperty()
	update_date = ndb.StringProperty()	
	cve_url = ndb.StringProperty()
	created = ndb.DateTimeProperty(auto_now_add=True)
	access_params = ndb.StringProperty()
	confidentiality_impact = ndb.IntegerProperty()
	integrity_impact = ndb.IntegerProperty()
	availability_impact = ndb.IntegerProperty()
	access_complexity = ndb.IntegerProperty()
	gained_access = ndb.IntegerProperty()
	authentication = ndb.IntegerProperty()
	
	@classmethod
	def createProfile(cls, cve_id , cwe_id , cwe_name, summary, cvss_score, exploit_count, publish_date, update_date, cve_url, confidentiality_impact, integrity_impact, availability_impact, access_complexity, gained_access, authentication):
		access_params = create_params()
		return CVEProfile(	cve_id = cve_id,
							cwe_id = cwe_id,
							cwe_name = cwe_name,
							summary = summary,
							cvss_score = cvss_score,
							exploit_count = exploit_count,
							publish_date = publish_date,
							update_date = update_date,
							cve_url = cve_url,
							confidentiality_impact = confidentiality_impact,
							integrity_impact = integrity_impact,
							availability_impact = availability_impact,
							access_complexity = access_complexity,
							gained_access = gained_access,
							authentication = authentication,
							access_params = access_params					)

class Service(ndb.Model):
	serviceID=ndb.IntegerProperty(required=True)
	name=ndb.StringProperty()
	status=ndb.StringProperty()
	impact=ndb.IntegerProperty()
	machineID=ndb.IntegerProperty()
	
	@classmethod
	def add_new_service(cls,serviceID,name,status,impact,machineID):
		return Service(		serviceID 	= 	serviceID,
							name 		= 	name,
							status 		=	status,
							impact 		= 	impact,
							machineID	=	machineID)

class Machine(ndb.Model):
	machineID=ndb.IntegerProperty(required=True)
	name=ndb.StringProperty()
	status=ndb.StringProperty()
	impact=ndb.IntegerProperty()
	
	@classmethod
	def add_new_machine(cls,machineID,name,status,impact):
		return Machine(		machineID 	= 	machineID,
							name 		= 	name,
							status 		=	status,
							impact 		= 	impact)

class Path(ndb.Model):
	pathID=ndb.IntegerProperty(required=True)
	name=ndb.StringProperty()
	status=ndb.StringProperty()
	src=ndb.IntegerProperty()
	dest=ndb.IntegerProperty()
	#cvss=ndb.StringProperty()
	cve_id = ndb.StringProperty()
	confidentiality_impact = ndb.IntegerProperty()
	integrity_impact = ndb.IntegerProperty()
	availability_impact = ndb.IntegerProperty()
	access_complexity = ndb.IntegerProperty()
	gained_access = ndb.IntegerProperty()
	authentication = ndb.IntegerProperty()
	
	@classmethod
	def add_new_path(cls,pathID,name,status,src,dest,cve_id,c_imp,i_imp,a_imp,acc_com,g_acc,auth):
		return Path(		pathID 						= 	pathID,
							name 						= 	name,
							status 						=	status,
							src 						= 	src,
							dest						=	dest,
							cve_id = cve_id,
							confidentiality_impact 		= 	c_imp,
							integrity_impact 			= 	i_imp,
							availability_impact 		= 	a_imp,
							access_complexity 			= 	acc_com,
							gained_access 				= 	g_acc,
							authentication 				= 	auth )

class Graph(ndb.Model):
	name=ndb.StringProperty(required=True)
	graphID=ndb.IntegerProperty(required=True)	
	#owner=ndb.KeyProperty(kind='User') #GUI push	
	owner_id=ndb.IntegerProperty(required=True) #JSON push
	machines=ndb.StructuredProperty(Machine, repeated=True)
	services=ndb.StructuredProperty(Service, repeated=True)
	paths=ndb.StructuredProperty(Path, repeated=True)	
	# keep track for reporting
	machine_hold = ndb.IntegerProperty(default=0)
	service_hold = ndb.IntegerProperty(default=0)
	path_hold = ndb.IntegerProperty(default=0)							
														
class CharacterImage(ndb.Model):
	blob = ndb.BlobKeyProperty()
	owner = ndb.StringProperty()
	access_params = ndb.StringProperty()	

class FacebookUser(ndb.Model):
	displayname = ndb.StringProperty(required=True)
	user_id = ndb.StringProperty()
	profile_url = ndb.StringProperty(required=True)
	access_token = ndb.StringProperty(required=True)
	access_params = ndb.StringProperty()
	email = ndb.StringProperty()
	joined_date = ndb.DateTimeProperty(auto_now_add=True)
	last_visited = ndb.DateTimeProperty(auto_now=True)
	avatar = ndb.StringProperty()

	
class User(ndb.Model):
	user_id=ndb.IntegerProperty(required=True)
	email = ndb.StringProperty()
	#displayname = ndb.StringProperty()
	username = ndb.StringProperty(required=True)
	org = ndb.StringProperty()
	access_params = ndb.StringProperty()	
	pw_hash = ndb.StringProperty()
	last_visited = ndb.DateTimeProperty(auto_now=True)
	joined_date = ndb.DateTimeProperty(auto_now_add=True)
	APIkey = ndb.StringProperty()
	graph_created = ndb.IntegerProperty(default=0)
	
	@classmethod
	def by_id(cls, uid):
		return User.get_by_id(uid)
	
		
	@classmethod
	def by_username(cls, username):
		u = User.query(User.username == username).get()
		return u
	
	@classmethod
	def by_login(cls, user_id):
		u = User.query(User.user_id == user_id).get()
		return u
		
	@classmethod
	def by_email(cls, email):
		u = User.query(User.email == email).get()
		return u

	@classmethod
	def register(cls, username,email, password, org, user_id):
		pw_hash = make_pw_hash(username, password)
		access_params = create_params()
		api_key = generate_key()
		return User(	user_id = user_id,
						username = username,
						email = email,
						pw_hash = pw_hash,
						org = org,
						access_params = access_params,
						APIkey = api_key	)
	
	@classmethod
	def add_test_user(cls, user_id , username ):
		return User(	user_id = user_id,
						username = username		)					
					
	@classmethod
	def login(cls, username, password):
		u = cls.by_username(username)
		if u and valid_pw(username, password, u.pw_hash):
			return u

	@classmethod
	def bypass_login(cls, user_id):
		u = cls.by_user_id(user_id)
		if u:
			return u		

#check unauthorized post
class APIDatabase(ndb.Model):
	api_id = ndb.IntegerProperty(required=True)
	api_key = ndb.StringProperty(required=True)

	@classmethod
	def add_new_key(cls,api_id,api_key):
		return APIDatabase(api_id = api_id, api_key = api_key)
	
class Step(ndb.Model):
	startTurn = ndb.IntegerProperty()
	endTurn = ndb.IntegerProperty()
	solType = ndb.StringProperty()
	cost = ndb.IntegerProperty()
	fromCity = ndb.IntegerProperty()
	toCity = ndb.IntegerProperty()
	pathID = ndb.IntegerProperty()
	score = ndb.IntegerProperty()
	ai = ndb.IntegerProperty()
	ci = ndb.IntegerProperty()
	ii = ndb.IntegerProperty()
	

class WayPoints(ndb.Model):
	waypointsID = ndb.IntegerProperty()	
	#just a graph
	status = ndb.StringProperty()
	mapID = ndb.IntegerProperty()
	playerID = ndb.StringProperty()
	score = ndb.IntegerProperty()
	step = ndb.StructuredProperty(Step, repeated=True)
	savedTurn = ndb.IntegerProperty()
	graphStat = ndb.TextProperty()

class WaypointReport(ndb.Model):
	waypointID = ndb.IntegerProperty(required=True)
	play_by = ndb.StringProperty(required=True)
	score = ndb.IntegerProperty(required=True)
	total_turn = ndb.IntegerProperty(required=True)
	total_impact = ndb.IntegerProperty(required=True)
	# query without exhausted joining
	graph_id = ndb.IntegerProperty(required=True)
	owner_id = ndb.IntegerProperty(required=True)
	play_count = ndb.IntegerProperty(default=0)
	maximum_impact = ndb.FloatProperty(required=True)
	#newly add 
	#status = ndb.StringProperty(required=True)
	@classmethod
	def add_new_waypoint_report(cls,waypointID,play_by,score,total_turn,total_impact,owner_id,graph_id,maximum_impact,status):
		return WaypointReport(	waypointID = waypointID, 
								play_by = play_by,
								score = score,
								total_turn = total_turn,
								total_impact = total_impact,
								graph_id = graph_id,
								owner_id = owner_id,
								play_count = 1,
								maximum_impact = maximum_impact )

class MapReport(ndb.Model):
	mapID = ndb.IntegerProperty(required=True)
	# map name doesn't exist?
	#map_name = ndb.IntegerProperty(required=True)
	play_count = ndb.IntegerProperty()
	score = ndb.IntegerProperty()
	avg_score = ndb.FloatProperty()
	total_turn = ndb.IntegerProperty()
	avg_total_turn = ndb.FloatProperty()
	total_impact = ndb.IntegerProperty()

	top_score = ndb.IntegerProperty(default=0)

	avg_total_impact = ndb.FloatProperty()
	maximum_impact = ndb.FloatProperty()
	# query without exhausted joining
	graph_id = ndb.IntegerProperty(required=True)
	owner_id = ndb.IntegerProperty(required=True)

	@classmethod
	def add_new_map_report(cls,mapID,play_count,score,avg_score,total_turn,avg_total_turn,total_impact,avg_total_impact,owner_id,graph_id,maximum_impact):
		return MapReport(	mapID = mapID, 
								play_count = play_count,
								score = score,
								avg_score = avg_score,
								total_turn = total_turn,
								avg_total_turn = avg_total_turn,
								total_impact = total_impact,
								avg_total_impact = avg_total_impact,
								graph_id = graph_id,
								owner_id = owner_id,
								maximum_impact = maximum_impact)

class PathReport(ndb.Model):
	mapID = ndb.IntegerProperty(required=True)
	graph_id = ndb.IntegerProperty(required=True)
	owner_id = ndb.IntegerProperty(required=True)
	pathID = ndb.IntegerProperty(required=True)
	srcMachine = ndb.StringProperty()
	dstMachine = ndb.StringProperty()
	srcService = ndb.StringProperty()
	dstService = ndb.StringProperty()
	### what for ???
	ai = ndb.IntegerProperty(required=True)
	ii = ndb.IntegerProperty(required=True)
	ci = ndb.IntegerProperty(required=True)
	### newly added
	av = ndb.IntegerProperty(required=True)
	ac = ndb.IntegerProperty(required=True)
	au = ndb.IntegerProperty(required=True)
	counting = ndb.IntegerProperty(default=0)
	name = ndb.StringProperty()

	@classmethod
	def add_new_path_report(cls,mapID,graph_id,owner_id,pathID,srcM,dstM,srcS,dstS,ai,ii,ci,av,ac,au,counting):
		return PathReport(
			mapID=mapID,
			graph_id=graph_id,
			owner_id=owner_id,
			pathID=pathID,
			srcMachine=srcM,
			dstMachine=dstM,
			srcService=srcS,
			dstService=dstS,
			ai=ai,ii=ii,ci=ci,
			av=av,au=au,ac=ac,
			counting=counting
		)

class Solution(ndb.Model):
	cve_id = ndb.StringProperty(required=True)
	cwe_name = ndb.StringProperty(required=True)
	from_map = ndb.IntegerProperty(required=True)
	counting = ndb.IntegerProperty(default=0)

	@classmethod
	def add_new_solution(cls,solution_id,cve_id,cwe_name,from_map):
		return Solution( solution_id=solution_id,cve_id=cve_id,cwe_name=cwe_name,from_map=from_map,counting=1)

class SolTypeReport(ndb.Model):
	owner_id = ndb.IntegerProperty(required=True)
	mapID = ndb.IntegerProperty(required=True)
	cve_id = ndb.StringProperty(required=True)
	service_name = ndb.StringProperty()
	solType_impact = ndb.IntegerProperty()
	cwe_name = ndb.StringProperty(required=True)
	counting = ndb.IntegerProperty(default=0)
	avg_hit = ndb.FloatProperty(default=1)
	@classmethod
	def add_new_soltype(cls,owner_id,mapID,cve_id,cwe_name,service_name,solType_impact):
		return SolTypeReport( 	owner_id = owner_id, 
								mapID = mapID,
								cve_id = cve_id,
								cwe_name = cwe_name,
								counting = 1,
								service_name = service_name,
								solType_impact = solType_impact)