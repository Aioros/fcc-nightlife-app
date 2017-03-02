'use strict';

var path = process.cwd();
var IntentHandler = require(path + '/app/controllers/intentHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var intentHandler = new IntentHandler();
	
	app.route('/')
		.get(function (req, res) {
			res.render('index', {user: req.user});
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			//res.redirect('back');
			res.json({status: "ok"});
		});
		
	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/afterauth',
			failureRedirect: '/afterauth'
		}));
		
	app.route('/afterauth')
		.get(function(req, res) {
			res.render('afterauth', {username: req.user.twitter.username});
		});
	
	app.route('/api/bars')
		.get(intentHandler.findBars)
		.post(isLoggedIn, intentHandler.toggleIntent);
	
};
