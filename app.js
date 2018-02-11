
const rssMod = require('./feedparser') 
	// for fetching the feed
const config = require('./config'); 
	// contains definations for the target feed, target RSS tags, analytics terms, SQL connection

const searchMod = require('./itemsearch');

const Database = require('./sqlConnection');

const start = searchMod.fetchTopics;
const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;
const getFeed = rssMod.getFeed;
	//getFeed is a promise that takes a URL argument and resolves with an array of RSS items

var searchItems = [], storyItems = [];

var url = config.feed;

// console.log(url);

start(function(err, topics) {

	//the start function runs through the list of topics, 
	//consumes a promise for the 'parseTheTopics' function, which checks for duplicates, 
	//then consumes the 'getFeed' promise for the RSS feed. 
	if (err) { console.log(err); }

	function parseTheTopics(topics) {
		return new Promise(function(resolve, reject) {
    	resolve(list(topics));
		});	
	}

	parseTheTopics(topics)
		.then(function(response) {
				searchItems = response;
			}, function(error) { 
				console.log("The parseTheTopics promise has failed.", error); 
			})
		.then(function(response) {
				return getFeed(url); 
				// A promise that returns the array of RSS items when resolved.
			})
		.then(function(feedItems) {
				console.log("Got the feed.");
				
				var promiseArray = [];

				for (var i = feedItems.length - 1; i >= 0; i--) {
					promiseArray[i] = new Promise(function(resolve, reject) {
						resolve(insertArticle(1, feedItems[i]) );
						// insertArticle is a promise that returns the article's SQL table ID on resolve
						// nest the search functions inside this promise, so that each article
						// is searched as it's added to the table
					});
				};
				
				return Promise.all(promiseArray).then( function(values) {
				  return values; // an array of article IDs
				}, error => { console.log("Failure in Promise.all()." + error); });
			
			}, function(error) {
		  	console.error("The getFeed promise has failed.", error);
			})
		.then(function(response) {
			console.log("Article IDs added: " + response);
		}, function(error) {console.error("The insertArticle promise has failed.", error); });



	function searchStory(item, topics) {
		// search for the parsed topics in each story, then add those into the place_mentions table
	  
	  topics.map(function(v,j,a) {
	  	if (v.not_preceded_by || v.not_followed_by) {
	  		itemsearch(itemObj.searchstring).qualifiedFind(v.topic, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			if (results[0]) { // console.log(results); 
	  			}
	  		})
	  	}
	  	else {
	  		itemsearch(itemObj.searchstring).find(v.topic, function(error, results) {
	  			if (results[0]) { // console.log(results); 
	  			}
	  		});
	  	}
	  })
	}

});


function insertArticle(rss_id, itemObject) {

	return new Promise(function(resolve, reject) {
		
		var headline = itemObject.title.replace(/'/g, "\\'");
		var summary = itemObject.summary.replace(/'/g, "\\'")
		var date = itemObject.date;

		var datestr = date.toISOString().slice(0, 19).replace('T', ' ');
		// console.log(datestr);

		var q = "INSERT INTO articles (rss_source_id, date, headline, summary, url_slug) VALUES ('" 
			+ rss_id + "','" + datestr + "','" + headline
			+ "','" + summary + "','" + itemObject.link + "')";
		
		var article_id, db = new Database; 

		db.query(q)
			.then( rows => { 
				// console.log(rows.insertId);
				console.log("Successfully added " + headline + ", ID#" + rows.insertId + " to article table."); 
				
				// return the unique id for the article as the insertArticle promise's resolution
				resolve(rows.insertId);  
				
			}, error => { console.error("The query promise has failed.", error); })
			.then( rows =>  db.close() )
			// .then( resolve(article_id) );
		
	});

}



function insertPlaceMention(place, article_id, relevance, context) {
	
	var q = "INSERT INTO place_mention (article_id, relevance_score, context, place_id) "
	 + "VALUES ('" + article_id + "','" + relevance + "','" + context + "','" + place_id + "')";

	var db = new Database; 

	db.query(q)
		.then( rows => { db.close; })
		.then( function() { callback( null ) });
}
