#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
import time
import datetime
import cgi
import os
# test base64
import base64
import urllib
import re
import random
import logging
import json
from json import JSONEncoder
from string import letters
import urllib2
import webapp2
import jinja2
import zipfile
import facebook
from google.appengine.api import urlfetch
urlfetch.set_default_fetch_deadline(45)
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from webapp2_extras import sessions
from google.appengine.api import images
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import mail
from xml.dom.minidom import parse, parseString
from HTMLParser import HTMLParser
from BeautifulSoup import BeautifulSoup
from random import randint
from models import *
from helpers import *


template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir),autoescape = False)

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__))
)

#Cyber Security War Game
FACEBOOK_APP_ID = "566537650156899"
FACEBOOK_APP_SECRET = "27ca20aee5a7af959a26157b3ddf2dc6"

#######################################################################################################
#######################################################################################################
#######################################################################################################
###############  						Handler Section								###################
#######################################################################################################
#######################################################################################################
#######################################################################################################
	
class FacebookHandler(webapp2.RequestHandler):   
	@property
	def fb_user(self):
		length = 5
		if self.session.get("user"):
		#if self.user:
		# User is logged in

			return self.session.get("user")
			#return self.user
		else:
		# Either used just logged in or just saw the first page
		# We'll see here
			cookie = facebook.get_user_from_cookie(self.request.cookies,
                                                   FACEBOOK_APP_ID,
                                                   FACEBOOK_APP_SECRET)
			if cookie:
			# Okay so user logged in.
			# Now, check to see if existing user
				user = FacebookUser.get_by_id(cookie["uid"])
				if not user:
				# Not an existing user so get user info
					graph = facebook.GraphAPI(cookie["access_token"])
					profile = graph.get_object('me')
					access_params = ''.join(random.choice(letters) for x in xrange(length))
							
					user = FacebookUser(
									id=str(profile["id"]),
									user_id=str(profile["id"]),
									displayname=profile["name"],									
									profile_url=profile["link"],
									access_token=cookie["access_token"],
									access_params=access_params,
									email=profile["email"]
								)
					user.put()
				elif user.access_token != cookie["access_token"]:
					user.access_token = cookie["access_token"]
					user.put()
			# User is now logged in

				self.session["user"] = dict(
								displayname=user.displayname,
								email=user.email,
								profile_url=user.profile_url,
								user_id=user.user_id,
								access_token=user.access_token,
								access_params=user.access_params,
								## fetch user key for further usage.
								user_key=user.key.id()
							)
				self.response.headers.add_header( 'Set-Cookie', '%s=%s; expires=Sun, 5-May-2016 23:59:59 GMT; Path=/' % ( "user_id", str(user.user_id) ))
				return self.session.get("user")
				#return user
		return None

	def dispatch(self):

		self.session_store = sessions.get_store(request=self.request)
		try:
			webapp2.RequestHandler.dispatch(self)
		finally:
			self.session_store.save_sessions(self.response)

	@webapp2.cached_property
	def session(self):
		return self.session_store.get_session()

		
class Handler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)
		
    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)
		
    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))
		
    def render_json(self, d):
        json_txt = json.dumps(d.to_dict())
        self.response.headers['Content-Type'] = 'application/json; charset=UTF-8'
        self.write(json_txt)
		
	def render_image(self, image):
		self.response.headers['Content-Type'] = 'image/jpeg'
		self.write(image)	
		
    def set_secure_cookie(self, name, val):
        cookie_val = make_secure_val(val)
        self.response.headers.add_header(
            'Set-Cookie',
            '%s=%s; expires=Sun, 5-May-2016 23:59:59 GMT; Path=/' % (name, cookie_val))

    def read_secure_cookie(self, name):
        cookie_val = self.request.cookies.get(name)
        return cookie_val and check_secure_val(cookie_val)

    def login(self, user):
        self.set_secure_cookie('user_id', str(user.key.id()))
		
    def bypass_login(self, user):
		self.response.headers.add_header( 'Set-Cookie', '%s=%s; expires=Sun, 5-May-2016 23:59:59 GMT; Path=/' % ( "user_id", user.user_id ))      
		
		#self.set_secure_cookie('user_id', str(user_id()))

    def logout(self):
		self.response.headers.add_header('Set-Cookie', 'user_id=; Path=/')
	
    def initialize(self, *a, **kw):     
		webapp2.RequestHandler.initialize(self, *a, **kw)
		uid = self.read_secure_cookie('user_id')
		self.user = uid and User.by_id(int(uid))
			
		
def init_data(self):
	data = {}
	if self.user:
		data = { 'user':self.user }
	if self.fb_user:
		data = { 'fb_user':self.fb_user }
		fb_user = self.fb_user
	data['facebook_app_id'] = FACEBOOK_APP_ID	
	return data	


class LogOutHandler(Handler):
	def get(self):
		self.logout()
		self.redirect('/')	
															
class PleaseLoginHandler(Handler,FacebookHandler):
	def get(self):
		if data['user'] or data['fb_user']:
			self.redirect('/')

class FacebookLoginHandler(FacebookHandler):
	def get(self):
		template = jinja_env.get_template('example.html')
		self.response.out.write(template.render(dict(
			facebook_app_id=FACEBOOK_APP_ID,
            fb_user=self.fb_user
        )))		
		
class FacebookLogoutHandler(Handler,FacebookHandler):
    def get(self):
        if self.fb_user is not None:
            self.session['user'] = None
        self.redirect('/')

#Silly Name		
class HubHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		fb_user = self.fb_user
		data['fb_user'] = self.fb_user
		if fb_user:
			self.redirect("/static/game/game.html")
		else:
			self.render("/page/hub.html",**data)

class AdminHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		user = self.user
		if user:
			graphs = Graph.query().filter(Graph.owner_id == user.user_id).order(Graph.graphID).fetch()
			data['graphs'] = graphs
			data['url'] = "home"
			self.render('home.html',**data)
		else:
			self.render('home.html',**data)
				
class MapHandler(Handler,FacebookHandler):
	def get(self):
		self.render('map.html')

class DashboardHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		self.render('dashboard2.html',**data)

class APIHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		data['url'] = "api"
		user = self.user
		self.render('/page/api.html',**data)

class CreateMapHandler(Handler,FacebookHandler):
	def post(self):
		name = escape_html(self.request.get('map'))
		desc = escape_html(self.request.get('desc'))
		access_params = create_params()
		map = Map(	name = name,
					desc = desc,
					access_params = access_params )
		map.put()
		time.sleep(2)
		self.redirect('/dashboard')

class AttackerHandler(Handler,FacebookHandler,blobstore_handlers.BlobstoreUploadHandler):
	def get(self):
		data = {}
		upload_url = blobstore.create_upload_url('/add-new-attacker')
		attackers = Attacker.query()
		vuls = ["Authentication","Buffer Overflow","Configuration Problem","Cryptographic error","Cross-Site Request Forgery","Insecure default configuration","Cross-site scripting",
		"Unknown vulnerability","SQL injection","Spoofing attacks","General race condition","Denial of Service"]
		data['upload_url'] = upload_url
		data['vuls'] = vuls
		data['attackers'] = attackers
		self.render('attacker.html',**data)

class DisplayImageHandler(blobstore_handlers.BlobstoreDownloadHandler):
	def get(self):
		upload_key_str = self.request.params.get('acc')
		upload = None
		if upload_key_str:
			upload = CharacterImage.query().filter(CharacterImage.access_params == upload_key_str ).get()		
		self.send_blob(upload.blob)
		
class AddNewAttackerHandler(Handler,FacebookHandler,blobstore_handlers.BlobstoreUploadHandler):
	def post(self):
		alias = escape_html(self.request.get('alias'))
		desc = escape_html(self.request.get('desc'))
		cve = escape_html(self.request.get('cve'))
		flawtype = escape_html(self.request.get('flawtype'))
		access_params = create_params()
		
		attacker = Attacker(	alias = alias,
								desc = desc,
								cve = cve,
								flawtype = flawtype,
								access_params = access_params	)
		attacker.put()
		time.sleep(2)
		
		for blob_info in self.get_uploads('upload'):
			upload = CharacterImage(
					blob = blob_info.key(),
					owner = alias,
					access_params = access_params	)
			upload.put()
		time.sleep(2)
		self.redirect('/attacker')

#NVD calculator
#http://nvd.nist.gov/cvss.cfm?version=2&name=CVE-2014-5318&vector=(AV:A/AC:M/Au:N/C:P/I:P/A:P)
				
class CVEProfileFetchHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		scores = [ 0,1,2,3,4,5,6,7,8,9,10 ]
		rows = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
		orders = [ "Publish Date", "Last Update Date", "CVE ID"]
		options = { 'hashexp' 	: 	'Vulnerability with Expliots', 
					'opcsrf' 	: 	'Cross Site Request Forgery',
					'opsqli'	:	'SQL Injection',
					'opmemc'	:	'Memory Corruption',
					'opginf'	:	'Gain Information',
					'opec'		:	'Code Execution',
					'opfileinc'	:	'File inclusion',
					'opxss'		:	'Cross Site Scripting',
					'ophttprs'	:	'HTTP Response Spliting',
					'opdos'		: 	'Denial of Service',
					'opgpriv'	:	'Gain Priviledges',
					'opov'		:	'Overflow',
					'opdirt'	: 	'Directory Transverse',
					'opbyp'		:	'Bypass Something' 				}
		profiles = CVEProfile.query()
		data['scores'] = scores
		data['rows'] = rows
		data['orders'] = orders
		data['options'] = options
		data['profiles'] = profiles
		self.render('fetch-profile.html',**data)
		
	def post(self):
		#init_default
		URL = "http://www.cvedetails.com/json-feed.php?"
		numrows = 10					#		MAX = 30
		vendor_id = 0					#		default = 0
		product_id = 0					#		default = 0
		version_id = 0					#		default = 0
		#option
		hashexp = 0 					#		vulnerability with exploits
		opcsrf = 0 						#		cross site request forgery
		opsqli = 0 						#		SQL injection
		opmemc = 0 						#		Memory corruption
		opginf = 0 						#		Gain information
		opec = 0 						#		Code Execution
		opfileinc = 0 					#		File inclusion
		opxss = 0 						#		Cross site scripting
		ophttprs = 0 					#		HTTP Response Spliting
		opdos = 0 						#		Denial of Service
		opgpriv = 0 					#		Gain Priviledge
		opov = 0 						#		Overflow
		opdirt = 0						#		Directory Transverse
		opbyp = 0						#		Bypass Something
		#order
		orderby = 0						#		Publish Date = 1 ,Last Update date = 2 , CVE ID = 3
		cvssscoremin = 0				# 		1-10

		#get check
		hashexp = setOption(bool(self.request.get('hashexp')))
		opcsrf = setOption(bool(self.request.get('opcsrf')))
		opsqli = setOption(bool(self.request.get('opsqli')))
		opmemc = setOption(bool(self.request.get('opmemc')))
		opginf = setOption(bool(self.request.get('opginf')))
		opec = setOption(bool(self.request.get('opec')))
		opfileinc = setOption(bool(self.request.get('opfileinc')))
		opxss = setOption(bool(self.request.get('opxss')))
		ophttprs = setOption(bool(self.request.get('ophttprs')))
		opdos = setOption(bool(self.request.get('opdos')))
		opgpriv = setOption(bool(self.request.get('opgpriv')))
		opov = setOption(bool(self.request.get('opov')))
		opdirt = setOption(bool(self.request.get('opdirt')))
		opbyp = setOption(bool(self.request.get('opbyp')))
		#get degree
		numrows = int(self.request.get('numrows'))
		cvssscoremin = int(self.request.get('cvssscoremin'))
		orderby = setOrderOption(self.request.get('orderby'))
		
		values = {	'numrows'		: 	numrows,
					'vendor_id'		:	vendor_id,
					'product_id'	:	product_id,
					'version_id'	:	version_id,
					'hashexp'		:	hashexp,
					'opcsrf'		:	opcsrf,
					'opsqli'		:	opsqli,
					'opmemc'		:	opmemc,
					'opginf'		:	opginf,
					'opec'			:	opec,
					'opfileinc'		:	opfileinc,
					'opxss'			:	opxss,
					'ophttprs'		:	ophttprs,
					'opdos'			:	opdos,
					'opgpriv'		:	opgpriv,
					'opov'			:	opov,
					'opdirt'		:	opdirt,
					'opbyp'			:	opbyp,
					'cvssscoremin'	:	cvssscoremin,
					'orderby'		:	orderby			}
		# 	GET
		data = urllib.urlencode(values)
		json_url = URL+data
		#	POST	req = urllib2.Request(URL,data)
		# 	FETCH
		json_objects = json.loads(urllib2.urlopen(json_url).read())
		# 	STORE TO NDB
		for object in json_objects:
			cve_id = object['cve_id']
			cwe_id = object['cwe_id']
			cwe_name = translateCWE_ID(cwe_id)
			summary = object['summary']
			cvss_score = float(object['cvss_score'])
			exploit_count = int(object['exploit_count'])
			publish_date = object['publish_date']
			update_date = object['update_date']
			cve_url = object['url']
			#fetch CVSS Score
			#cvss metrix
			confidentiality_impact = 1  	# None = 1 , Partial = 2, Complete =3 
			integrity_impact = 1			# None = 1 , Partial = 2, Complete =3 
			availability_impact = 1			# None = 1 , Partial = 2, Complete =3 
			access_complexity = 1			# Low = 1 , Medium = 2, High = 3 
			gained_access = 1				# None = 1 , User = 2 , Admin = 3 
			authentication  = 1				# Not Required = 1 , Single System = 2, Multiple systems = 3  
			CVSS_URL = cve_url
			soup = BeautifulSoup(urllib2.urlopen(CVSS_URL))
			#confidentiality_impact
			c_impact = soup.find(text='Confidentiality Impact')
			c_impact = c_impact.findNext('span')
			if c_impact.find(text='Partial'):
				confidentiality_impact = 2
			if c_impact.find(text='Complete'):
				confidentiality_impact = 3
			#integrity_impact
			i_impact = soup.find(text='Integrity Impact')
			i_impact = i_impact.findNext('span')
			if i_impact.find(text='Partial'):
				integrity_impact = 2
			if i_impact.find(text='Complete'):
				integrity_impact = 3
			#availability_impact
			a_impact = soup.find(text='Availability Impact')
			a_impact = a_impact.findNext('span')
			if a_impact.find(text='Partial'):
				availability_impact = 2
			if a_impact.find(text='Complete'):
				availability_impact = 3
			#access_complexity
			a_complex = soup.find(text='Access Complexity')
			a_complex = a_complex.findNext('span')
			if a_impact.find(text='Medium'):
				access_complexity = 2
			if a_impact.find(text='High'):
				access_complexity = 3
			#authentication
			authen = soup.find(text='Authentication')
			authen = authen.findNext('span')
			if authen.find(text='Single system'):
				authentication = 2
			if authen.find(text='Multiple systems'):
				authentication = 3
			#gained access
			g_access = soup.find(text='Gained Access')
			g_access = g_access.findNext('span')
			if g_access.find(text='User'):
				gained_access = 2
			if g_access.find(text='Admin'):
				gained_access = 3				
			put_object = CVEProfile.createProfile(cve_id, cwe_id, cwe_name, summary, cvss_score, exploit_count, publish_date, update_date, cve_url, confidentiality_impact, integrity_impact, availability_impact, access_complexity, gained_access, authentication )
			put_object.put()
		time.sleep(2)
		self.redirect('/fetch-profile')
			
	
class CVSScoreHandler(Handler,FacebookHandler):
	def get(self):
		data = {}
		#init metrix
		confidentiality_impact = 1  	# None = 1 , Partial = 2, Complete =3 
		integrity_impact = 1			# None = 1 , Partial = 2, Complete =3 
		availability_impact = 1			# None = 1 , Partial = 2, Complete =3 
		access_complexity = 1			# Low = 1 , Medium = 2, High = 3 
		gained_access = 1				# None = 1 , User = 2 , Admin = 3 
		authentication  = 1				# Not Required = 1 , Single System = 2, Multiple systems = 3  
		CVSS_URL = "http://www.cvedetails.com/cve/CVE-2014-6043/"
		#page = urllib2.urlopen(CVSS_URL)
		soup = BeautifulSoup(urllib2.urlopen(CVSS_URL))
		#confidentiality_impact
		c_impact = soup.find(text='Confidentiality Impact')
		c_impact = c_impact.findNext('span')
		if c_impact.find(text='Partial'):
			confidentiality_impact = 2
		if c_impact.find(text='Complete'):
			confidentiality_impact = 3
		#integrity_impact
		i_impact = soup.find(text='Integrity Impact')
		i_impact = i_impact.findNext('span')
		if i_impact.find(text='Partial'):
			integrity_impact = 2
		if i_impact.find(text='Complete'):
			integrity_impact = 3
		#availability_impact
		a_impact = soup.find(text='Availability Impact')
		a_impact = a_impact.findNext('span')
		if a_impact.find(text='Partial'):
			availability_impact = 2
		if a_impact.find(text='Complete'):
			availability_impact = 3
		#access_complexity
		a_complex = soup.find(text='Access Complexity')
		a_complex = a_complex.findNext('span')
		if a_impact.find(text='Medium'):
			access_complexity = 2
		if a_impact.find(text='High'):
			access_complexity = 3
		#authentication
		authen = soup.find(text='Authentication')
		authen = authen.findNext('span')
		if authen.find(text='Single system'):
			authentication = 2
		if authen.find(text='Multiple systems'):
			authentication = 3
		#gained access
		g_access = soup.find(text='Gained Access')
		g_access = g_access.findNext('span')
		if g_access.find(text='User'):
			gained_access = 2
		if g_access.find(text='Admin'):
			gained_access = 3		
		
		data['confidentiality_impact'] = confidentiality_impact
		data['integrity_impact'] = integrity_impact
		data['availability_impact'] = availability_impact
		data['access_complexity'] =  access_complexity
		data['gained_access'] = gained_access
		data['authentication'] = authentication
		self.render('test.html',**data)

class GetGraphHandler(Handler,FacebookHandler):	
	def get(self):
		id = int(escape_html(self.request.get('id')))
		u = Graph.query().filter(Graph.graphID == id).get()		
		self.render_json(u)
		
class CreateGraphHandler(Handler,FacebookHandler):		
	def post(self):
		name = escape_html(self.request.get('graph-name'))
		api_key = escape_html(self.request.get('api_key'))
		owner = User.query().filter(User.APIkey == api_key).get()
		owner_id = owner.user_id		
		graphID = assign_graph_ID(Graph)
		graph_amount = owner.graph_created + 1
		owner.graph_created = graph_amount

		u = Graph(	graphID		= 	graphID,
					name		=	name,
					owner_id = owner_id)
		u.put()
		owner.put()
		time.sleep(2)
		self.write("success")
	
class EditGraphHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		id = int(escape_html(self.request.get('id')))
		service_status = [ "found" ,"attacking" ]
		machine_status = [ "hidden", "found" , "ready" ,"attacking" ]
		path_status = [ "","unused", "used" ]
		graph = Graph.query().filter(Graph.graphID == id).get()
		profiles = CVEProfile.query()
		data['graph'] = graph
		data['service_status'] = service_status
		data['machine_status'] = machine_status
		data['path_status'] = path_status
		data['profiles'] = profiles
		self.render('edit-graph-2.html',**data)

#rewrite version
class GraphProfileHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		id = int(escape_html(self.request.get('id')))
		graph = Graph.query().filter(Graph.graphID == id).get()
		data['graph'] = graph
		self.render("/page/graph-profile.html",**data)
		
class DeleteGraphHandler(Handler,FacebookHandler):
	def post(self):
		id = int(escape_html(self.request.get('id')))
		u = Graph.query().filter(Graph.graphID == id).get().key 
		u.delete()
		time.sleep(2)
		self.redirect('/create-graph')

def valid_api_key(api_key):
	u = APIDatabase.query().filter(APIDatabase.api_key == api_key)
	if u:
		return True
	else:
		return False
		
class AddNewMachineHandler(Handler,FacebookHandler):
	def post(self):
		id = int(self.request.get('GraphID'))
		u = Graph.query().filter(Graph.graphID == id).get()
		machineID = u.machine_hold + 1
		#auto generate machine ID
		#machineID = int(escape_html(self.request.get('machineID')))
		name = escape_html(self.request.get('machineName'))
		status = escape_html(self.request.get('machineStatus'))
		impact = int(escape_html(self.request.get('machineImpact')))
		api_key = escape_html(self.request.get('api_key'))
		if valid_api_key(api_key):
			#check if api_key is existed?	
			v = Machine.add_new_machine(machineID,name,status,impact)
			#v.put()
			if u.machines:
				u.machines.append(v)
				u.machine_hold = machineID
			else:
				u.machines = [ v ]
				u.machine_hold = machineID
			u.put()
			self.write("success!")
		
class AddNewServiceHandler(Handler,FacebookHandler):
	def post(self):
		id = int(self.request.get('GraphID'))
		u = Graph.query().filter(Graph.graphID == id).get()
		serviceID = u.service_hold + 1
		#serviceID = int(escape_html(self.request.get('serviceID')))
		name = escape_html(self.request.get('serviceName'))
		status = escape_html(self.request.get('serviceStatus'))
		impact = int(escape_html(self.request.get('serviceImpact')))
		machineID = escape_html(self.request.get('serviceMachineID'))
		api_key = escape_html(self.request.get('api_key'))
		if valid_api_key(api_key):
			v = Service.add_new_service(serviceID,name,status,impact,machineID)
			if u.services:
				u.services.append(v)
				u.service_hold = serviceID
			else:
				u.services = [ v ]
				u.service_hold = serviceID
			u.put()
			self.write("success!")
		
class AddNewPathHandler(Handler,FacebookHandler):
	def post(self):
		id = int(self.request.get('GraphID'))
		u = Graph.query().filter(Graph.graphID == id).get()
		#pathID = int(escape_html(self.request.get('pathID')))
		pathID = u.path_hold + 1
		#GET CVSS FROM PROFILE
		name = escape_html(self.request.get('pathName'))
		cve_id = escape_html(self.request.get('cve_id'))
		v = CVEProfile.query().filter(CVEProfile.cve_id == cve_id).get()
		#ASSIGN SCORE
		c_imp = v.confidentiality_impact
		i_imp = v.integrity_impact
		a_imp = v.availability_impact 
		acc_com = v.access_complexity
		g_acc = v.gained_access
		auth = v.authentication

		#STATUS???
		status = escape_html(self.request.get('pathStatus'))
		#SERVICE STATUS
		src = int(escape_html(self.request.get('pathSrc')))
		dest = int(escape_html(self.request.get('pathDest')))
		api_key = escape_html(self.request.get('api_key'))	
		if valid_api_key(api_key):
			w = Path.add_new_path(pathID,name,status,src,dest,cve_id,c_imp,i_imp,a_imp,acc_com,g_acc,auth)
			if u.paths:
				u.paths.append(w)
				u.path_hold = pathID
			else:
				u.paths = [ w ]
				u.path_hold = pathID
			u.put()
			self.write("success!")

class post_graph_v2Handler(Handler,FacebookHandler):
	def post(self):
		#SETUP GRAPH
		name = escape_html(self.request.get('name'))
		api_key = escape_html(self.request.get('api_key'))
		graphID = assign_graph_ID(Graph)
		owner = User.query().filter(User.APIkey == api_key).get()
		owner_id = owner.user_id
		if check_api_key(api_key, User):
			u = Graph(	graphID		= 	graphID,
						name		=	name,
						#owner = owner.key,
						owner_id = owner_id)
			u.put()
			self.write("put owner successfully")
			number_of_graph = owner.graph_created + 1
			owner.graph_created = number_of_graph
			owner.put()
			self.write("put graph successfully")
		else:
			self.write("Invalid API key")
		
class PostJSONGraphHandler(Handler,FacebookHandler):
	def post(self):
		#SETUP GRAPH
		name = escape_html(self.request.get('name'))
		api_key = escape_html(self.request.get('api_key'))
		graphID = assign_graph_ID(Graph)
		owner = User.query().filter(User.APIkey == api_key).get()
		if not owner:
			self.error(401)
			self.response.write("api_key doesn't match.")
			return
		
		owner_id = owner.user_id
		graph_amount = owner.graph_created + 1
		owner.graph_created = graph_amount
		owner.put()
		
		#ADD GRAPH FIRST
		u = Graph(	graphID		= 	graphID,
					name		=	name,
					owner_id = owner_id)
		u.put()
		#MAKE SURE GRAPH IS SUBMITTED
		time.sleep(2)		
		#PREPARED OBJECT
		machine_objects = json.loads(self.request.get('machines'))
		service_objects = json.loads(self.request.get('services'))
		path_objects = json.loads(self.request.get('paths'))
		#FLASHING
		uv = Graph.query().filter(Graph.graphID == graphID).get()
		for key, value in machine_objects.iteritems():
			for i, item in enumerate(value): 
				machineID = value[i]['machineID']
				temp = Graph.query().filter(Graph.graphID == graphID).get()
				#machineID = temp.machine_hold + 1
				#automated new machineID
				name = value[i]['name']
				status = value[i]['status']
				impact = 0
				v = Machine.add_new_machine(int(machineID),name,status,int(impact))
				if uv.machines:
					uv.machines.append(v)
					uv.machine_hold = machineID
				else:
					uv.machines = [ v ]
					uv.machine_hold = machineID
				uv.put()
		#FLASH
		#self.write(uv)
		
		uw = Graph.query().filter(Graph.graphID == graphID).get()
		for key, value in service_objects.iteritems():
			for i, item in enumerate(value):
				serviceID = value[i]['serviceID']
				temp = Graph.query().filter(Graph.graphID == graphID).get()
				#serviceID = temp.service_hold + 1				
				name = value[i]['name']
				status = value[i]['status']
				impact = 0
				machineID = value[i]['machineID']
				w = Service.add_new_service(int(serviceID),name,status,int(impact),machineID)
				if uw.services:
					uw.services.append(w)
					uw.service_hold = serviceID
				else:
					uw.services = [ w ]
					uw.service_hold = serviceID	
				uw.put()
		#FLASH
		#self.write(uv)
		
		ux = Graph.query().filter(Graph.graphID == graphID).get()
		for key, value in path_objects.iteritems():
			for i, item in enumerate(value):
				#pathID = value[i]['pathID']
				temp = Graph.query().filter(Graph.graphID == graphID).get()
				pathID = temp.path_hold + 1
				cve_id = value[i]['cve']
				name = value[i]['name']
				status = "unused"
				src = value[i]['src']
				dest = value[i]['dest']
				g_acc = value[i]['av']
				auth = value[i]['au']
				c_imp = value[i]['ci']
				acc_com = value[i]['ac']
				i_imp = value[i]['ii']
				a_imp = value[i]['ai']
				x = Path.add_new_path(int(pathID),name,status,int(src),int(dest),cve_id,int(c_imp),int(i_imp),int(a_imp),int(acc_com),int(g_acc),int(auth))
				if ux.paths:
					ux.paths.append(x)
					ux.path_hold = pathID
				else:
					ux.paths = [ x ]
					ux.path_hold = pathID
				ux.put()				
		#FLASH
		#self.write(ux)		

		json_graph = Graph.query().filter(Graph.graphID == graphID).get()		
		self.render_json(json_graph)				
			
class MapListHandler(Handler,FacebookHandler):
	def get(self):
		graphs = Graph.query()
		output=[];
		for g in graphs:
			urlkey = g.graphID;
			output.append({"key":urlkey, "name":g.name})

		output = json.dumps(output);
		self.response.write(output);

class CreateWayPointsHandler(Handler,FacebookHandler):
	def post(self):
		playerID = self.request.get('playerID') #should get this from session
		mapID = int(escape_html(self.request.get('mapID')))
		waypoints = WayPoints.query(WayPoints.playerID==playerID, WayPoints.mapID==mapID, WayPoints.status=="playing").get()
		if not waypoints:
			waypointsID = WayPoints.query().count()+1 #shoud be generated somehow
			graph = Graph.query(Graph.graphID==mapID).get()
			waypoints = WayPoints(waypointsID=waypointsID, playerID=playerID, mapID=mapID, score=0, savedTurn=0, status="playing", graphStat=json.dumps(graph.to_dict()))
		key = waypoints.put()
		self.response.write(json.dumps(waypoints.to_dict()))

class AddStepHandler(Handler,FacebookHandler):
	def post(self):
		#debug
		logging.info("%s", self.request.get('waypoint'))
		###
		waypointsKey = int(self.request.get('waypoint'))
		waypoint = WayPoints.query().filter(WayPoints.waypointsID == waypointsKey).get()

		startTurn = int(self.request.get('startTurn'))
		endTurn = int(self.request.get('endTurn'))
		solType = self.request.get('solType')

		#require cve_id according to its cwe_id
		cve_id = str(self.request.get('cve_id'))
		score = int(self.request.get('score'))
		ii = int(self.request.get('ii'))
		ai = int(self.request.get('ai'))
		ci = int(self.request.get('ci'))

		cost = int(self.request.get('cost'))
		# host analysis on this???
		fromCity = int(self.request.get('from'))
		toCity = int(self.request.get('to'))
		pathID = int(self.request.get('pathID'))

		step = Step(startTurn=startTurn, endTurn=endTurn, solType=solType, cost=cost, fromCity=fromCity, toCity=toCity, pathID=pathID, ai=ai, ci=ci, ii=ii, score=score)
		if waypoint.step:
			waypoint.step.append(step)
		else:
			waypoint.step = [step]

		waypoint.put()
		logging.info("%s", waypoint)
		waypoint.put()
		#block comment 
		#TODO: Report table will no longer use this.?

		#1 generate waypoint report
		#generate report when step is added
		graph = Graph.query().filter(Graph.graphID == waypoint.mapID).get()
		owner_id = graph.owner_id
		if graph:
			owner_id = graph.owner_id
			graph_id = graph.graphID
		else:
			return self.write("no graph available")
		waypointID = waypoint.waypointsID

		play_by = waypoint.playerID
		#no module for score calculate yet
		score = score
		total_turn = endTurn - startTurn
		#no module for calculate impact
		total_impact = ai + ii + ci
		### query waypoint with user id
		u = WaypointReport.query().filter(WaypointReport.play_by == play_by).get()
		if u:
			#waypoint for this player is already existed just update
			u.score = u.score + score
			u.total_turn = u.total_turn + total_turn
			u.total_impact = u.total_impact + total_impact
			u.play_count = u.play_count + 1
			u.maximum_impact = u.maximum_impact + 10
			u.put()
		else:
			#create a new one
			maximum_impact = 10
			new_waypoint = WaypointReport.add_new_waypoint_report(waypointID,play_by,score,total_turn,total_impact,owner_id,graph_id,maximum_impact, "playing")
			new_waypoint.put()
		#create new map report
		mapID = waypoint.mapID
		v = MapReport.query().filter(MapReport.mapID == mapID).get()
		if v:
			v.play_count = v.play_count + 1
			play_count = v.play_count
			top_score = v.top_score
			#update top score
			v.score = v.score + score
			if top_score < v.score:
				v.top_score = v.score
			v.avg_score = v.score / ( play_count*1.000 )
			v.total_turn = v.total_turn + total_turn
			v.avg_total_turn = v.total_turn / ( play_count*1.000 )
			v.total_impact = v.total_impact + total_impact
			v.avg_total_impact = v.total_impact / ( play_count*1.000 )
			v.maximum_impact = v.maximum_impact + 10
			v.put()
		else:
			#create a new one
			#play_count,avg_score,avg_total_turn,avg_total_impact,owner_id,graph_id)
			play_count = 1
			maximum_impact = 10
			avg_score = score
			avg_total_turn = total_turn
			avg_total_impact = total_impact
			new_map_report = MapReport.add_new_map_report(mapID,play_count,score,avg_score,total_turn,avg_total_turn,total_impact,avg_total_impact,owner_id,graph_id,maximum_impact)
			new_map_report.put()
		# cve and cwe analysis
		solType_impact = ai + ii + ci
		cwe_name = solType
		#from city may =0
		myGraph = Graph.query().filter(Graph.graphID == waypoint.mapID).get()
		service_name = "This is machine name."
		for machine in myGraph.machines:
			if machine.machineID == toCity:
				service_name = machine.name
		#uv.
			#first time solTypeReport
		w = SolTypeReport.query().filter(SolTypeReport.mapID == mapID , \
			SolTypeReport.cve_id == cve_id,SolTypeReport.service_name == service_name, \
			SolTypeReport.cwe_name == cwe_name).get()
		if w:
			
			w.counting = w.counting + 1
			#newly added
			if w.avg_hit:
				avg_hit = w.avg_hit
			else:
				avg_hit = 1
			if v:
				w.avg_hit = avg_hit / v.play_count
			else:
				w.avg_hit = avg_hit / new_map_report.play_count
			if w.solType_impact == None:
				w.solType_impact = 0
			w.solType_impact = w.solType_impact + 1
		else:
			w = SolTypeReport.add_new_soltype(owner_id,mapID,cve_id,cwe_name,service_name,solType_impact)
		w.put()



		srcM = "External network"
		dstM = "Impossible"
		srcS = "External network"
		dstS = "Impossible"
		myPath = None
		src = None
		dst = None
		my_name = "eiei"


		for p in graph.paths:
			if p.pathID==pathID:
				myPath = p

		if myPath:
			#find service in path
			for s in graph.services:
				if s.serviceID==p.src:
					srcS = s.name
					src = s
				if s.serviceID==p.dest:
					dstS = s.name
					dst = s
			#find machine in path
			for m in graph.machines:
				if m.machineID==src.machineID:
					srcM = m.name
				if m.machineID==dst.machineID:
					dstM = m.name
			my_name = myPath.name
		# path analysis

		# query path with pathID
		old_path_report = PathReport.query().filter(PathReport.pathID == pathID).get()
		# naming path

		if old_path_report: #path exist
			#update
			old_path_report.counting = old_path_report.counting + 1
			old_path_report.ai = old_path_report.ai + 1
			old_path_report.ii = old_path_report.ii + 1
			old_path_report.ci = old_path_report.ci + 1
			
			old_path_report.srcMachine = srcM
			old_path_report.srcService = srcS
			old_path_report.dstMachine = dstM
			old_path_report.dstService = dstS
			old_path_report.put()
		else:
			new_path_report = PathReport.add_new_path_report(
				mapID,
				graph_id,
				owner_id,
				pathID,
				srcM, dstM, srcS, dstS,
				ai,ii,ci,
				0,0,0,
				#myPath.gained_access, myPath.access_complexity, myPath.authentication,
				counting=1
			)
			if my_name:
				new_path_report.name = my_name
			else:
				my_name = "No name path"
				new_path_report.name = my_name
			new_path_report.put()
		self.write("success")

class CreateDummyUserHandler(Handler,FacebookHandler):
	def get(self):
		user_id = int(self.request.get('user_id'))
		username = self.request.get('username')
		dummy_user = User.add_test_user(user_id, username)
		dummy_user.put()
		self.write("Successfully add user \n user_id : %s \n username : %s \n" % (str(user_id),username))

class BypassLoginHandler(Handler,FacebookHandler):
	def get(self):
		user_id = int(self.request.get('user_id'))
		u = User.query().filter(User.user_id == user_id).get()
		self.bypass_login(u)
		self.write("Login successfully!")

class OverallReportHandler(Handler,FacebookHandler):
	def get(self):
		data = init_data(self)
		user = self.user
		graphs = Graph.query().filter(Graph.owner_id == user.user_id).order(-Graph.graphID)
		waypoint_reports = WaypointReport.query().filter(WaypointReport.owner_id == user.user_id).fetch()
		map_reports = MapReport.query().filter(MapReport.owner_id == user.user_id).fetch()
		soltype_reports = SolTypeReport.query().filter(SolTypeReport.owner_id == user.user_id).order(-SolTypeReport.counting).fetch()
		path_reports = PathReport.query().filter(PathReport.owner_id == user.user_id).fetch()
		#  blue , orange , green , gray, pink , brown , purple , yellow , red
		pallettes = [ 'DEDEDE' , '5DA5DA' , 'FAA43A' , 'F15854' , '60BD68', 'F17CB0' , 'B2912F' , 'B276B2', 'DECF3F', '60BD68', '4D4D4D' ]
		data['waypoint_reports'] = waypoint_reports
		data['map_reports'] = map_reports		
		data['graphs'] = graphs
		data['soltype_reports'] = soltype_reports
		data['path_reports'] = path_reports
		data['url'] = "report"
		data['pallettes'] = pallettes
		self.render("/page/report.html",**data)

#error result not show yet!
class AdminRegisterHandler(Handler,FacebookHandler):
	def post(self):
		username = escape_html(self.request.get('username'))
		email = escape_html(self.request.get('email'))
		password = escape_html(self.request.get('password'))
		re_password = escape_html(self.request.get('re_password'))
		org = escape_html(self.request.get('org'))
		regis_able = False
		if valid_username(username) and valid_email(email) and valid_password(password) and checkPassword(password,re_password) and org:
			regis_able = True
		if regis_able:
			user_id = User.query().count() + 1
			u = User.register(username,email,password,org, user_id)
			u.put()
			#Update Database API Key
			api_id = APIDatabase.query().count() + 1
			v = APIDatabase.add_new_key(api_id,u.APIkey)
			v.put()

			time.sleep(2)
			self.login(u)
			self.redirect('/admin?acc='+u.access_params)
		else:
			self.write("something went wrong please try again")

class AdminLoginHandler(Handler,FacebookHandler):
	def post(self):
		username = escape_html(self.request.get('username'))
		password = escape_html(self.request.get('password'))
		u = User.login(username,password)
		if u:
			self.login(u)
			self.redirect('/admin?acc='+u.access_params)
		else:
			self.write("something went wrong please try again")

class PlayerLoginHandler(Handler,FacebookHandler):
	def post(self):
		pass

class PlayerRegisterHandler(Handler,FacebookHandler):
	def post(self):
		pass
		
class MapSummarizeHandler(Handler, FacebookHandler):
	def get(self):
		retJson = {"avgScore":0, "avgTurn":0, "playCount":0}
		map_id = int(self.request.get("map_id"))
		waypoints = WayPoints.query(WayPoints.mapID==map_id)
		#avg field value for every waypoints
		avgScore = 0
		avgTurn = 0
		wpCount = 0
		topScore = 0
		for wp in waypoints:
			if wp.score > topScore:
				topScore = wp.score
			avgTurn += wp.savedTurn
			avgScore += wp.score
			wpCount += 1
		retJson["avgTurn"] = avgTurn/(wpCount*1.0)
		retJson["playCount"] = wpCount
		retJson["avgScore"] = avgScore/(wpCount*1.0)
		retJson["topScore"] = topScore
		self.response.write(json.dumps(retJson))

class RenderCVEGraphHandler(Handler, FacebookHandler):
	def get(self):
		mapID = int(self.request.get("mapID"))
		soltype_report = SolTypeReport.query().filter(SolTypeReport.owner_id == user.user_id,SolTypeReport.mapID == mapID).order(-SolTypeReport.counting).fetch()
		data['soltype_report'] = soltype_report
		self.render("/partial/cve-graph.html",**data)	

class HostSummarizeHandler(Handler, FacebookHandler):
	def get(self):
		retJson = []
		map_id = int(self.request.get("map_id"))
		waypoints = WayPoints.query(WayPoints.mapID==map_id)
		graphOfMap = Graph.query(Graph.graphID==map_id).get()
		
		#create report obj
		for m in graphOfMap.machines:
			obj={
				"machineName": m.name,
				"machineID": m.machineID,
				"hits": 0,
				"impact": 0,
				"maxImpact": 0,
				"avgHits": 0,
				"ai": 0,
				"ci": 0,
				"ii": 0
			}
			retJson.append(obj)
		retJson.sort(key=lambda x: x["machineID"], reverse=False)

		#logging.info("retJson: %s", str(retJson))
		wpCount = 0
		for wp in waypoints:
			wpCount += 1
			for step in wp.step:
				#logging.info("step.toCity: %d", step.toCity)
				retJson[step.toCity-1]["hits"] += 1
				retJson[step.toCity-1]["ai"] += step.ai or 0
				retJson[step.toCity-1]["ci"] += step.ci or 0
				retJson[step.toCity-1]["ii"] += step.ii or 0

		for o in retJson:
			if o["hits"] != 0:
				o["avgHits"] = o["hits"]/(wpCount*1.0)
				o["ai"] /= o["hits"]*1.0
				o["ci"] /= o["hits"]*1.0
				o["ii"] /= o["hits"]*1.0

		retJson.sort(key=lambda x: x["hits"], reverse=True)
		self.response.write(json.dumps(retJson))

class NodeSummarizeHandler(Handler, FacebookHandler):
	def get(self):
		retJson = [];
		map_id = int(self.request.get("map_id"))
		waypoints = WayPoints.query(WayPoints.mapID==map_id)
		graphOfMap = Graph.query(Graph.graphID==map_id).get()

		for s in graphOfMap.services:
			obj = {
				"name": s.name,
				"serviceID": s.serviceID,
				"machineID": s.machineID,
				"hits": 0,
				"avgHits": 0,
				"avgAI": 0,
				"avgCI": 0,
				"avgII": 0,
				"maxAI": 0,
				"maxCI": 0,
				"maxII": 0
			}
			retJson.append(obj)
		
		retJson.sort(key=lambda x: x["serviceID"], reverse=False)

		wpCount = 0
		i = 0
		for wp in waypoints:
			wpCount += 1
			for step in wp.step:
				for p in graphOfMap.paths:
					if p.pathID == step.pathID:
						i = p.dest-1
				retJson[i]["hits"] += 1
				retJson[i]["avgAI"] += step.ai or 0
				retJson[i]["avgCI"] += step.ci or 0
				retJson[i]["avgII"] += step.ii or 0
				retJson[i]["maxAI"] = max(retJson[i]["maxAI"], step.ai)
				retJson[i]["maxCI"] = max(retJson[i]["maxCI"], step.ci)
				retJson[i]["maxII"] = max(retJson[i]["maxCI"], step.ii)

		for o in retJson:
			if o["hits"] != 0:
				o["avgHits"] = o["hits"]/(wpCount*1.0)
				o["avgCI"] /= o["hits"]*1.0
				o["avgAI"] /= o["hits"]*1.0
				o["avgII"] /= o["hits"]*1.0

		retJson.sort(key=lambda x: x["hits"], reverse=True)
		self.response.write(json.dumps(retJson))

class DummyReportHandler(Handler, FacebookHandler):
	def get(self):
		self.render('dummy.html')

class PathSummarizeHandler(Handler, FacebookHandler):
	def get(self):
		retJson = [];
		map_id = int(self.request.get("map_id"))
		waypoints = WayPoints.query(WayPoints.mapID==map_id)
		graphOfMap = Graph.query(Graph.graphID==map_id).get()
		av_list = ["remote","adjacent","local"]
		ac_list = ["Low","Med","High"]
		au_list = ["None","1","2+"]
		ci_list = ["None","Partial","Complete"]
		ii_list = ["None","Partial","Complete"]
		ai_list = ["None","Partial","Complete"]
		for p in graphOfMap.paths:
			av = av_list[p.gained_access-1]
			ac = ac_list[p.access_complexity-1]
			au = au_list[p.authentication-1]
			ai = ai_list[p.availability_impact-1]
			ii = ii_list[p.integrity_impact-1]
			ci = ci_list[p.confidentiality_impact-1]
			obj = {
				"name": p.name,
				"pathID": p.pathID,
				"hits": 0,
				"avgHits": 0,
				"av": p.gained_access,
				"ac": p.access_complexity,
				"au": p.authentication,
				"ai": p.availability_impact,
				"ii": p.integrity_impact,
				"ci": p.confidentiality_impact
			}
			retJson.append(obj)

		retJson.sort(key=lambda x: x["pathID"], reverse=False)

		wpCount = 0
		i = 0
		for wp in waypoints:
			wpCount += 1
			for step in wp.step:
				if step.pathID != 0:
					retJson[step.pathID-1]["hits"] +=1

		for o in retJson:
			if wpCount!=0:
				o["avgHits"] = o["hits"]/(wpCount*1.0);

		retJson.sort(key=lambda x: x["hits"], reverse=True)
		self.response.write(json.dumps(retJson))
		logging.info("path report sent.")

class updateScoreHandler(Handler, FacebookHandler):
	def post(self):
		newScore = int(self.request.get("score"))
		waypointID = int(self.request.get("waypoint"))
		currentTurn = int(self.request.get("currentTurn"))
		graphStat = self.request.get("graphStat")
		wp = WayPoints.query(WayPoints.waypointsID==waypointID).get()
		wp.score = newScore
		wp.graphStat = graphStat
		wp.savedTurn = currentTurn
		wp.put()

class getHighScoreHandler(Handler, FacebookHandler):
	def get(self):
		mapID = int(self.request.get("map_id"))
		highWp = WayPoints.query(WayPoints.mapID==mapID).order(-WayPoints.score).fetch(10)
		scoreList = [];
		for wp in highWp:
			scoreList.append(wp.score)
		self.response.write(scoreList)

class endGameHandler(Handler, FacebookHandler):
	def post(self):
		wpid = int(self.request.get("wpid"))
		lastScore = int(self.request.get("score"))
		reason = self.request.get("reason")
		turn = int(self.request.get("turn"))
		wp = WayPoints.query(WayPoints.waypointsID==wpid).get()
		wp.score = lastScore
		wp.status = reason
		wp.savedTurn = turn
		wp.put()
		self.response.write("success")

app = webapp2.WSGIApplication([
    ('/', HubHandler),
    ('/admin',AdminHandler),
	('/logout',LogOutHandler),
	('/logout_with_facebook',FacebookLogoutHandler),
	('/map',MapHandler),
	('/dashboard',DashboardHandler),
	('/create-map',CreateMapHandler),
	('/attacker',AttackerHandler),
	('/add-new-attacker',AddNewAttackerHandler),
	('/displayImage',DisplayImageHandler),
	('/fetch-profile',CVEProfileFetchHandler),
	('/fetch-score',CVSScoreHandler),
	('/edit-graph',EditGraphHandler),
	('/create-graph',CreateGraphHandler),
	('/get-graph',GetGraphHandler),
	('/delete-graph',DeleteGraphHandler),
	('/add-new-machine',AddNewMachineHandler),
	('/add-new-service',AddNewServiceHandler),
	('/add-new-path',AddNewPathHandler),
	('/maplist', MapListHandler),
	('/postGraph',PostJSONGraphHandler),
	('/create-waypoint', CreateWayPointsHandler),
	('/add-step', AddStepHandler),
	('/create-dummy-user', CreateDummyUserHandler),
	('/bypass-login', BypassLoginHandler),
	('/overall-report',OverallReportHandler),
	('/admin-login',AdminLoginHandler),
	('/admin-regis',AdminRegisterHandler),
	('/player-regis',PlayerRegisterHandler),
	('/player-login',PlayerLoginHandler),
	('/api',APIHandler),
	('/post_graph_v2',post_graph_v2Handler),
	('/graph-profile',GraphProfileHandler),
	('/map-report', MapSummarizeHandler),
	('/host-report', HostSummarizeHandler),
	('/node-report', NodeSummarizeHandler),
	('/path-report', PathSummarizeHandler),
	('/update-score', updateScoreHandler),
	('/get-highscore', getHighScoreHandler),
	('/end-game', endGameHandler),
	('/render-cve-graph',RenderCVEGraphHandler),
	('/dummy-report',DummyReportHandler)	
], debug=True,config=config)
	