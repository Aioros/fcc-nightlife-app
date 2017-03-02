'use strict';

var oauthSignature = require('oauth-signature');  
var n = require('nonce')();
var request = require('request');
var qs = require('querystring');

var Intent = require('../models/intents.js');

function IntentHandler () {
	
	var yelpSearch = function(params, callback) {

		var httpMethod = 'GET';
		
		var url = 'http://api.yelp.com/v2/search';
		
		var defaultParams = {
			sort: '2',
			category_filter: 'nightlife'
		};
		
		var requiredParams = {
			oauth_consumer_key : process.env.YELP_CONSUMER_KEY,
			oauth_token : process.env.YELP_TOKEN,
			oauth_nonce : n(),
			oauth_timestamp : n().toString().substr(0,10),
			oauth_signature_method : 'HMAC-SHA1',
			oauth_version : '1.0'
		};
		
		var parameters = Object.assign(defaultParams, params, requiredParams);
		
		var consumerSecret = process.env.YELP_CONSUMER_SECRET;
		var tokenSecret = process.env.YELP_TOKEN_SECRET;
		
		var signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
		
		parameters.oauth_signature = signature;
		
		var paramURL = qs.stringify(parameters);
		
		var apiURL = url+'?'+paramURL;
		
		request(apiURL, function(error, response, body){
			return callback(error, response, body);
		});
	
	};
	
	this.findBars = function(req, res) {
		if (!req.query.hasOwnProperty("q") || req.query.q === "")
			return res.send({error: "No search term specified"});
			
		yelpSearch({location: req.query.q}, function(err, response, body) {
			if (err)
				return res.send({error: "Error using Yelp Search API"});
			var data = JSON.parse(body);
			
			var promises = data.businesses.map(bar => Intent.find({barId: bar.id}));
			
			Promise.all(promises).then(function(barsIntents) {
				data.businesses = data.businesses.map((bar, i) => Object.assign(bar, {intents: barsIntents[i]}));
				res.json(data);
			});
			
		});
	};
	
	this.toggleIntent = function(req, res) {
		Intent.find({'barId': req.body.barId})
			.then(function(intents) {
				var count = intents.length;
				var userIntents = intents.filter(intent => intent._user.equals(req.user.id));
				if (userIntents.length > 0) {
					count -= userIntents.length;
					userIntents.forEach(intent => intent.remove());
				} else {
					count++;
					var intent = new Intent({_user: req.user.id, barId: req.body.barId});
					intent.save();
				}
				res.json({count: count});
			});
	};

}

module.exports = IntentHandler;
