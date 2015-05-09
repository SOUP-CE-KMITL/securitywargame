from random import randint
import hashlib
import hmac
import logging
import json
from json import JSONEncoder
from string import letters
import time
import datetime
import cgi
import re
from webapp2_extras import sessions
from google.appengine.api import users
import random
from models import *

secret = "you-will-never-guess"
config = {}
config['webapp2_extras.sessions'] = dict(secret_key='slhflsnhflsgkfgvsdbfksdhfksdhfkjs')

def assign_graph_ID():
	graphID = 0
	graphs = Graph.query().order(-Graph.graphID).get()
	if graphs:
		graphID = graphs.graphID + 1
	else:
		graphID = 1
	return graphID

def valid_pw(name, password, h):
	salt = h.split(',')[0]
	return h == make_pw_hash(name, password, salt)

class DateEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.date):
            return obj.isoformat()
        return JSONEncoder.default(self, obj)

def split_by_colon(str):
	result = []
	result = str.split(';')
	return result
	
def create_params():
	length = 10
	return ''.join(random.choice(letters) for x in xrange(length))

def checkPassword(password,re_password):
	if password == re_password:
		return True
	else:
		return False
		
##html input escape
def escape_html(s):
	return cgi.escape(s, quote = True)

## user stuff goes here ##
def make_secure_val(val):
    return '%s|%s' % (val, hmac.new(secret, val).hexdigest())

def check_secure_val(secure_val):
    val = secure_val.split('|')[0]
    if secure_val == make_secure_val(val):
        return val
def make_salt(length = 5):
	return ''.join(random.choice(letters) for x in xrange(length))

def make_pw_hash(name, pw, salt = None):
	if not salt:
		salt = make_salt()
	h = hashlib.sha256(name + pw + salt).hexdigest()
	return '%s,%s' % (salt, h)

USER_RE = re.compile(r"^[\S\s]{3,25}$")
def valid_displayname(display_name):
    return display_name and USER_RE.match(display_name)

def valid_username(username):
    return username and USER_RE.match(username)

LOGIN_RE = re.compile(r"^[a-zA-Z0-9_-]{6,25}$")
def valid_loginname(login_name):
    return login_name and LOGIN_RE.match(login_name)

PASS_RE = re.compile(r"^.{6,25}$")
def valid_password(password):
    return password and PASS_RE.match(password)

EMAIL_RE  = re.compile(r'^[\S]+@[\S]+\.[\S]+$')
def valid_email(email):
    return not email or EMAIL_RE.match(email)

def string_normalize(s):
	s = re.sub('[^0-9a-zA-Z]+', '', s)
	s = s.lower()
	return s

def generate_key():
	length = 20
	api_key = ''.join(random.choice(letters) for x in xrange(length))		
	return api_key
	
def translateCWE_ID(cwe_id):
	return { 	"20" 	: 	"Input Validation",
				"22"	:	"Path Transversal",
				"59"	:	"Link Following",
				"78"	:	"OS Command Injection",
				"89"	:	"SQL Injection",
				"287"	: 	"Authentication Issues",
				"255"	:	"Credentials Management",
				"264"	: 	"Permission Priviledge & Access Point",
				"119"	:	"Buffer Error",
				"352"	:	"Cross-site request forgery",
				"310"	:	"Cryptography Issues",
				"94"	:	"Code Injection",
				"134"	:	"Format String Vulnerability",
				"16"	:	"Configuration",
				"189"	:	"Numeric Errors",
				"362"	:	"Race Condition",
				"399"	:	"Resource Management Error"	
			}.get(cwe_id,"Others")
			
def setOption(option):
	if option:
		option = 1
	else:
		option = 0
	return option

def setOrderOption(option):
	return {	"publishDate"		:	1,
				"lastUpdateDate"	:	2,
				"CVE_id"			:	3}.get(option,1)

def check_api_key(api_key):
	u = User.query().filter(User.APIkey == api_key).get()
	if u:
		return True
	else:
		return False