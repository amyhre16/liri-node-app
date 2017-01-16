# liri-node-app

## LIRI
LIRI (*Language Interpretation and Recognition Interface*) is a NodeJS command line app that takes in parameters and gives you back data. Each action uses its own NPM package to run Server-side API request.

To run LIRI, the user enters `node liri.js <action> <parameter` to run the node package specific to that action.

### Actions
* `my-tweets`
	* This action uses [Twitter](https://www.npmjs.com/package/twitter) to display my last 20 tweets and when they were created in the terminal/bash window.
	* This action does not require a `parameter`
* `spotify-this-song`
	* This action uses [Spotify](https://www.npmjs.com/package/spotify) to return the following information about a song
		* Arist(s)
		* The song's name
		* A preview link of the song from Spotify
		* The album that the song is from
	* The parameter this action takes in is the name of a song. If no song is provided, LIRI will return information for "The Sign" by Ace of Base
* `movie-this`
	* This action uses [Request](https://www.npmjs.com/package/request) to return the following information about a movie
		* Title of the movie
		* Year the movie came out
		* IMBb Rating of the movie
		* Country where the movie was produced
		* Language of the movie
		* Plot of the movie
		* Actors in the movie
		* Rotten Tomatoes Rating
		* Rotten Tomatoes URL
	* The parameter this action takes in is the name of a movie. If no movie is provided, LIRI will will output data for the movie 'Mr. Nobody'
* `do-what-it-says`
	* This action uses [`fs`](https://www.npmjs.com/package/file-system) to read `random.txt` and run the command inside the file.

### Logging Actions
Every action that the user executes is logged in a file named `log.txt` with the date/time, the command the user executed, and the data returned by LIRI.

