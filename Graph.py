from google.appengine.ext import ndb
import webapp2
import json
###### FUNCTIONS #########################################################

###### MODELS ############################################################

class Service(ndb.Model):
	serviceID=ndb.IntegerProperty(required=True);
	name=ndb.StringProperty();
	status=ndb.StringProperty();
	impact=ndb.IntegerProperty();
	machineID=ndb.IntegerProperty();

class Machine(ndb.Model):
	machineID=ndb.IntegerProperty(required=True);
	name=ndb.StringProperty();
	status=ndb.StringProperty();
	impact=ndb.IntegerProperty();

class Path(ndb.Model):
	pathID=ndb.IntegerProperty(required=True);
	name=ndb.StringProperty()
	status=ndb.StringProperty()
	src=ndb.IntegerProperty();
	dest=ndb.IntegerProperty();
	cvss=ndb.KeyProperty()

class Graph(ndb.Model):
	name=ndb.StringProperty(required=True)
	machines=ndb.StructuredProperty(Machine, repeated=True)
	services=ndb.StructuredProperty(Service, repeated=True)
	paths=ndb.StructuredProperty(Path, repeated=True)

###### HANDLERS ###########################################################
class AddFakeData(webapp2.RequestHandler):
	def get(self):
		com1=Machine(machineID=1, name="com1");
		com2=Machine(machineID=2, name="com2");
		com3=Machine(machineID=3, name="com3");

		s1=Service(serviceID=1, name="www", machineID=1);
		s2=Service(serviceID=2, name="db", machineID=1);
		s3=Service(serviceID=3, name="ssh", machineID=1);
		s4=Service(serviceID=4, name="ftp", machineID=1);
		s5=Service(serviceID=5, name="xmpp", machineID=2);
		s6=Service(serviceID=6, name="abcd", machineID=3);

		p1=Path(pathID=1, src=1, dest=2, name="2014-5555");
		p2=Path(pathID=2, src=2, dest=5, name="3333");
		p3=Path(pathID=3, src=3, dest=4, name="1111");
		p4=Path(pathID=4, src=6, dest=5, name="888");
		p5=Path(pathID=5, src=4, dest=2, name="777");
		p6=Path(pathID=6, src=1, dest=5, name="2012-2102");

		graph1=Graph(
			name='test.org', 
			machines=[com1, com2, com3],
			services=[s1,s2,s3,s4,s5,s6],
			paths=[p1, p2, p3, p4, p5, p6]
		)

		graph1Key=graph1.put()
		self.response.write(graph1Key.urlsafe())

class LoadGraphHandler(webapp2.RequestHandler):
	def post(self):
		key = ndb.Key(urlsafe=self.request.get('keystring'))
		g = Graph.get_by_id(key.id())
		player = self.request.get('player')
		output = g.to_dict()
		output = json.dumps(output)
		self.response.write(output)
	