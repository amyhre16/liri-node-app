var request = require('request');
var Twitter = require('twitter');
var spotify = require('spotify');
var fs = require('fs');

var action = process.argv[2];
var parameter = "";

if (process.argv.length > 3) {
	parameter = process.argv[3];
	for (var i = 4; i < process.argv.length; i++) {
		parameter += " " + process.argv[i];
	}
	parameter = parameter.trim();
}

runSwitch();

function runSwitch() {
	switch (action) {
		case "my-tweets": // done
			/*
				command is
					node liri.js my-tweets
				consoles last 20 tweets
			*/
			console.log("Hello from the Twitter-veeerrrse");
			twitterRequest();
			break;
		case "spotify-this-song":
			/*
				command is
					node liri.js spotify-this-song '<song name here>'
				consoles
					artist(s)
					song's name
					preview link of the song from Spotify
					album that song is from
				default song is "The Sign" by Ace of Base
			*/
			spotifyRequest();
			break;
		case "movie-this": // done
			/*
				command is
					node liri.js movie-this '<movie name here>'
				consoles
					title of movie
					year the movie came out
					IMDB Rating of the movie
					Country where the movie was produced
					Language of the movie
					Plot of the movie
					Actors in the movie
					Rotten Tomatoes Rating
					Rotten Tomatoes URL
				default movie is 'Mr. Nobody'
			*/
			omdbRequest();
			break;
		default:
			/*
				command is 
					node liri.js do-what-it-says
				runs spotify-this-song for "I Want it That Way"
			*/
			doTheOtherThing();
			break;
	}
}

function twitterRequest() {
	/*
		execute the keys.js file
			exports the twitterKeys object, properties are the keys
		assign the exported object to twitterKeys var
	*/
	var twitterKeys = require("./keys.js").twitterKeys;

	// assign the keys and secrets to their respective variable
	var consumer_key = twitterKeys["consumer_key"];
	var consumer_secret = twitterKeys["consumer_secret"];
	var access_token_key = twitterKeys["access_token_key"];
	var access_token_secret = twitterKeys["access_token_secret"];

	// create a new Twitter object
	var client = new Twitter({
		consumer_key: consumer_key,
		consumer_secret: consumer_secret,
		access_token_key: access_token_key,
		access_token_secret: access_token_secret
	});
	/*client.post('statuses/update', {status: '@CaitrionaLink I\'m tweeting this from my console using POST :D'}, function(err, tweet, response) {
		if (err) {
			throw err;
		}
		else {
			console.log(tweet);
		}
	});*/
	client.get('search/tweets', {q: 'AnthonyMyhre', count: 20}, function(err, tweets, response) {
		if (err) {
			console.log(err);
			throw err;
		}
		else {
			var tweetInfo = "";
			for (var i = 0; i < tweets.statuses.length; i++) {
				tweetInfo += "\n" + tweets.statuses[i].text + "\n";
			}
			console.log(tweetInfo);
			logInfo(tweetInfo);
		}
	});
}

function spotifyRequest() {
	if (parameter === "") {
		parameter = 'The Sign';
	}
	/*spotify.get(parameter, function(err,data) {
		if (err) {
			throw err;
		}
		else {
			console.log(data);
		}
	});*/
	spotify.search({type: 'track', query: parameter}, function(err, data) {
		if (err) {
			throw err;
		}

		else {
			var songInfo = data.tracks.items[0];
			console.log(songInfo.artists[0].name);
			console.log(songInfo.name);
			console.log(songInfo.album.name);
			console.log(songInfo.preview_url);
		}
	});
}

function omdbRequest() {
	if (parameter === "") {
		parameter = 'Mr. Nobody';
	}
	var queryURL = 'http://www.omdbapi.com/?t=' + parameter + "&r=json&tomatoes=true";
	request(queryURL, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			body = JSON.parse(body);
			var movieInfo = "";
			var title = body.Title;
			movieInfo += "Title: " + title + "\n";

			var year = body.Year;
			movieInfo += "Year: " + year + "\n";

			var imdbRating = body.imdbRating;
			movieInfo += "IMDB Rating: " + imdbRating + "\n";

			var country = body.Country;
			movieInfo += "Country: " + country + "\n";

			var language = body.Language;
			movieInfo += "Language: " + language + "\n";

			var plot = body.Plot;
			movieInfo += "Plot: " + plot + "\n";

			var actors = body.Actors;
			movieInfo += "Actors: " + actors + "\n";

			var rottenTomRating = body.tomatoRating;
			movieInfo += "Rotten Tomato Rating: " + rottenTomRating + "\n";

			var rottenTomURL = body.tomatoURL;
			movieInfo += "Rotten Tomato URL: " + rottenTomURL + "\n";
			console.log(movieInfo);
			logInfo(movieInfo);
		}
		else if (err) {
			console.log("error");
			throw err;
		}
		else {
			console.log("Status Code: " + response.statusCode);
		}
	});
}

function doTheOtherThing() {
	// do the other thing
	fs.readFile("random.txt", "utf8", function(err, data) {
		var dataArr = data.split(",");
		action = dataArr[0];
		if (dataArr.lenth > 1) {
			parameter = dataArr[1];
		}
		runSwitch();
	});
}

function logInfo(info) {
	var date = new Date();
	var log = date + "\nnode liri.js " + action + " " + parameter + "\n" + info + "\n";
	fs.appendFile("log.txt", log, function(err) {
		if (err) {
			throw err;
		}
	});
}