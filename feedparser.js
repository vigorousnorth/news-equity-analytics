var FeedParser = require('feedparser');
var request = require('request'); 
	// for fetching the feed
// var mysql = require('mysql');
	// later - for saving the results to a queryable table

var config = require('./config'); 
	// contains definations for the target feed, target RSS tags and analytics terms

var searchmod = require('./itemsearch');
var start = searchmod.parseTopics;
var itemsearch = searchmod.itemsearch;
	// regular expression search functions are in here

var req = request(config.feed)
var feedparser = new FeedParser();
// var mysql = require('mysql');

// Stuff for our SQL database (to do later)...
// var con = mysql.createConnection({
//   host: config.sql_host,
//   user: config.sql_user,
//   password: config.sql_pw
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

start(function(err, topics) {

	if (err) { console.log(err); }

	req.on('error', function (error) {
	  console.log("Request error: " + error);
	});
	 
	req.on('response', function (res) {
	  var stream = this; // `this` is `req`, which is a stream
	  
	  if (res.statusCode !== 200) {
	    this.emit('error', new Error('Bad status code'));
	  }
	  else {
	    stream.pipe(feedparser);
	  }
	});
	 
	feedparser.on('error', function (error) {
	  console.log("Feedparser error: " + error)
	});
	 
	feedparser.on('readable', function () {
	  // This is where the action is!
	  var stream = this; // `this` is `feedparser`, which is a stream
	  var meta = this.meta; 
	  // **NOTE** the "meta" is always available in the context of the feedparser instance
	  var item;
	 
	  while (item = stream.read()) {

	  	// This is where RSS article items are consumed and processed.
	    console.log('Got article: %s', item.title );
	    // console.log(item.summary);	// subhed

	    var hed = item.title ? item.title : '';
	    var subhed = item.summary ? item.summary : '';
	    var story = item.description ? item.description : ''; // story content
	    
	    // we can score the 'strength' of each topic mention by scoring it
	    // according to how high up in each item it is
	    story_l = story? story.split(' ').length : 0;
	    subhed_l = subhed ? subhed.split(' ').length : 0;
	    hed_l = hed ? hed.split(' ').length : 0;
	    
	    var itemObj = { 
	    	'permalink' : item.permalink,
	    	'pubdate' : item.pubdate,
	    	'hed_index' : [0,hed_l],
	    	'subhed_index' : [hed_l,subhed_l],
	    	'body_index' : [(hed_l + subhed_l), (hed_l + subhed_l + story_l)],
			'searchstring' : hed + "|" + subhed + "|" + story
		}
	    
	    // In here, call the "find" function from find.js on each item.
	    topics.map(function(v,i,a) {
	    	if (v.not_preceded_by || v.not_followed_by) {
	    		itemsearch(itemObj.searchstring).qualifiedFind(v.topic, v.not_preceded_by, v.not_followed_by, function(error, results) {
	    			if (results[0]) { console.log(results); }
	    		})
	    	}
	    	else {
	    		itemsearch(itemObj.searchstring).find(v.topic, function(error, results) {
	    			if (results[0]) { console.log(results); }
	    		});
	    	}
	    })

	    continue;

		}
	});
});
