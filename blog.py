import main

class BlogHandler:
	self.render("blog.html")

app = webapp2.WSGIApplication([
    ('/blog', BlogHandler),

], debug=True,config=config)