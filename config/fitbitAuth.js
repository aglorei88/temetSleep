var config = require('./../config.js');
var passport = require('passport');
var FitbitStrategy = require('passport-fitbit').Strategy;

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (){
	// PASSPORT SESSION STARTUP
	// to support persistent login sessions, passport needs to be able to serialize users into and deserialize users out of the session
	passport.serializeUser(function (user, done){
		done(null, user);
	});
	passport.deserializeUser(function (id, done){
		console.log('----------------deserialize----------------');
		User.findById(id, function (error, user){
			done(error, user);
		});
	});

	// USE FITBIT STRATEGY WITHIN PASSPORT
	// strategies in passport require a 'verify' function, which accept credentials (token, tokenSecret, and fitbit profile), and invoke a callback with a user object
	passport.use(new FitbitStrategy({
			consumerKey: config.production.FITBIT_CONSUMER_KEY,
			consumerSecret: config.production.FITBIT_CONSUMER_SECRET,
			callbackURL: 'http://localhost:8000/auth/fitbit/callback'
		},
		function (token, tokenSecret, profile, done){
			User.findOne({
				'providerUserId': profile.id
			},
			function (error, user){
				if (error) {
					console.log(error);
				}
				// if no user, create with values from fitbit
				if (!user) {
					user = new User({
						provider: 'fitbit',
						providerUserId: profile.id,
						token: token,
						tokenSecret: tokenSecret
					});
					user.save(function (error){
						if (error) console.log(error);
					});
				// else, found user and return
				} else {
					return done(null, user);
				}
			});
		}
	));
}();