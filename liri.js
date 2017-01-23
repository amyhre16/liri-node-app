// indicates the code should be executed in strict mode
"use strict";

// import necessary node packages
var request = require('request');
var Twitter = require('twitter');
var spotify = require('spotify');
var fs = require('fs');

// capture the action the user wants to execute
var action = process.argv[2];

/*
	initialize parameter variable
	if the length of argv is more than 3, that means that they have added a parameter
		run a loop to capture the full parameter which keeps the user from having to put the parameter in quotes
*/
var parameter = "";
if (process.argv.length > 3) {
	parameter = process.argv[3];
	for (var i = 4; i < process.argv.length; i++) {
		parameter += " " + process.argv[i];
	}
	parameter = parameter.trim();
}

// run the switch statement
runSwitch();

// action that user inputed are checked against each case to run the correct function
// at the end of each case, break out of the switch statement so that the other cases are not executed (even if they do not match up w/ action)
function runSwitch() {
	switch (action) {
		case "my-tweets":
			/*
				command is
					node liri.js my-tweets
				consoles my latest tweets
			*/
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

		case "movie-this":
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

		case "do-what-it-says":
			/*
				command is 
					node liri.js do-what-it-says
				runs spotify-this-song for "I Want it That Way"
			*/
			doWhatItSays();
			break;

		default:
			logError(action + " is not a valid action. Valid actions are 'my-tweets', 'spotify-this-song', 'movie-this', and do-what-it-says'");
	} // end of switch statement
} // end of runSwitch()


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
	}); // end of client object

	/*
		search for latest tweets by @AnthonyMyhre (limit is 20)
		if there is an error, then run the logError function
		otherwise, concatenate the tweets to a string and console/log the tweet info
	*/
	client.get('search/tweets', {q: 'AnthonyMyhre', count: 20}, function(err, tweets, response) {
		if (err) {
			logError(err);
		}
		else {
			var tweetInfo = "";
			for (var i = 0; i < tweets.statuses.length; i++) {
				tweetInfo += "\n" + tweets.statuses[i].text + "\n";
			}
			console.log(tweetInfo);
			logInfo(tweetInfo);
		}
	}); // end of client.get
} // end of twitterRequest


function spotifyRequest() {
	// if the parameter is empty, we want to set the The Sign as the default value
	if (parameter === "") {
		parameter = 'The Sign';
	}

	/*
		search for the parameter track
		if there is an error, log it
		otherwise, concatenate the needed info and log it
	*/
	spotify.search({type: 'track', query: parameter}, function(err, data) {
		if (err) {
			logError(err);
		}

		else {
			var songInfo = data.tracks.items[0];
			var info = "\nArtist(s): " + songInfo.artists[0].name +
				"\nSong Name: " + songInfo.name +
				"\nAlbum Name: " + songInfo.album.name +
				"\nPreview URL: " +songInfo.preview_url + "\n";
			console.log(info);
			logInfo(info);
		}
	}); // end of spotify.search
} // end of spotifyRequest()


function omdbRequest() {
	// if the user does not request a movie, we set the default parameter to Mr. Nobody and search for that
	if (parameter === "") {
		parameter = 'Mr. Nobody';
	}

	/*
		generate the query URL
		t=parameter means that parameter is the title we're searching for
		r=json makes the response return json
		tomatoes=true means that we want the Rotten Tomatoes information about the movie
	*/
	var queryURL = 'http://www.omdbapi.com/?t=' + parameter + "&r=json&tomatoes=true";

	// use the query URL to search for the movie on OMDb
	request(queryURL, function(err, response, body) {
		// if there is not an error and the status code is 200, parse the JSON into an object we can access
		// assign the concatenation of the movie information we're looking for to movieInfo
		// console/log movieInfo
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
		} // end of if (!err && status code === 200)

		// if there's an error, log it
		else if (err) {
			logError(err);
		}
		// otherwise, output the status code
		else {
			console.log("Status Code: " + response.statusCode);
		}
	}); // end of requestion function
} // end of omdbRequest


function doWhatItSays() {
	/*
		read the random.txt file and tell the fs package to expect utf-8 characters
		if there's an error, log it
		otherwise, split the data by ',' (this puts everything in between the commas into an array)
			the first index is the action and the rest of the indecies are the parameter (if the array has more than 1 index)
			run runSwitch() to execute the user's command
	*/
	fs.readFile("random.txt", "utf8", function(err, data) {
		if (err) {
			logError(err);
		}
		else {
			var dataArr = data.split(",");
			action = dataArr[0];
			if (dataArr.length > 1) {
				parameter = dataArr[1];
				for (var i = 2; i < dataArr.length; i++) {
					parameter += dataArr[i] + " ";
				}
				parameter = parameter.trim();
			}
			runSwitch();
		}
	}); // end of fs.readFile
} // end of doWhatItSays()


function logInfo(info) {
	/*
		logs the command run by the user in log.txt
		logs:
			timestamp of command
			command that the user put in the terminal
			data returned by the command
	*/
	var date = new Date();
	var log = "===========================================================================================\n\n" + date + "\nnode liri.js " + action + " " + parameter + "\n" + info + "\n===========================================================================================\n\n";
	fs.appendFile("log.txt", log, function(err) {
		if (err) {
			throw err;
		}
	}); // end of fs.appendFile
} // end of logInfo()


// want to log any errors that occur b/c of node packages (does not log b/c of fs.appendFile)
function logError(err) {
	var date = new Date();
	var log = "* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n\n" + date + "\nnode liri.js " + action + " " + parameter + "\nError: " + err + "\n\n* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n\n";
	fs.appendFile("log.txt", log, function(fsERR) {
		if (fsERR) {
			throw fsERR;
		}
	}); // end of fs.appendFile
	console.log(err);
} // end of logError()