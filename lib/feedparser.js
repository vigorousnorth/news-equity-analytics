'use strict'

const FeedParser = require('feedparser')
const request = require('request')

require('events').EventEmitter.prototype._maxListeners = 200;


module.exports = (url) => {

	return new Promise(function (resolve, reject) {

		let req = request(url);
		let items = [];

		let parser = new FeedParser()

		req.on('error', (err) => { 
			reject( err )
		})

		req.on('response', (res) => {
		  // check if status code is not correct
		  if (res.statusCode !== 200) {
		    reject( Error('Bad status code') );
		  }
		  // if the res is correct, when can pipe the response
		  req.pipe(parser); // pipe response to feedparser
		})

		parser.on('error', (err) => {	console.log(err)	})

		parser.on('end', () => {
		  // handle that we've finished reading articles
		  console.log('End of feed');
		  resolve(items);  // resolve the feedparsing promise
		})

		parser.on('readable', () => {
		  let item = parser.read()
		  let meta = parser.meta // get the metadata of the feed
		  while (item) {
		    // do whatever you want with the item
		    items.push(item);
		    // get the next item, if none, then item will be null next time
		    item = parser.read()
		  }
		})

	}).catch( (error) => console.log("Failure in feedparser module: ", error, "for feed ", url) )

}


