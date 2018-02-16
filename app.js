
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

				for (var i = 0;  i < feedItems.length - 1;  i++) {
					
					var article = feedItems[i];

					if (article) { promiseArray[i] = searchAndAdd(feedItems[i]); }

						// nest the search functions inside this promise, so that each article
						// is searched as it's added to the table	
				};
				
				return Promise.all(promiseArray).then( function(values) {
				  return values; // an array of article IDs
				}, error => { console.log("Failure in Promise.all()." + error ); });
			
			}, function(error) {
		  	console.error("The getFeed promise has failed.", error);
			})
		.then(function(response) {
			console.log("Article IDs added: " + response);
		}, function(error) {console.error("The insertArticle promise has failed.", error); });


	async function searchAndAdd(article) {

		let resultsPromises = [];
		
		var searchstring = article.title.replace(/'/g, "\\'") + "|" 
			+ article.summary.replace(/'/g, "\\'") + "|"
			+ article.description;
				
		try { var article_id = await insertArticle(1, article); } catch (err) {console.log(err); }
		// insertArticle is a promise that returns the article's SQL table ID on resolve
		
		var article_results = await searchStory(searchstring, searchItems); 
		// returns an array of topic mentions from the article
		// each result is an object of the form {topic: topic name, id: id from the place_mentions table
		// index: position within the search string, and value: search result context }
		
		for (var j = article_results.length - 1; j >= 0; j--) {
			var thisHit = article_results[j];
			// console.log(thisHit);
			try {
				resultsPromises[j] = await insertPlaceMention(thisHit.place_id, article_id, thisHit.index, thisHit.value);
				// insertPlaceMention is a promise that returns the row ID from the place_mentions table

			} catch (err) {console.err(err); }
		};

		return Promise.all(resultsPromises).then( function(values) {
					console.log(values.length + " entries added to place_mentions table from article " + article_id)
				  return article_id; // an array of article IDs
				}, error => { console.log("Failure in searchAndAdd Promise.all() " + error ); });
			
	}

	function searchStory(searchstring, searchtopics) {
		
		//  searchtopics is an array of objects of the form {topic: topic name, id: SQL table id, not_preceded_by, not_followed_by}
		var mentions = [];
	  //	each mention is an object of the form {topic: topic, index: position within the search string, and value: search result context }
	  searchtopics.map(function(v,j,a) {
	  	if (v.not_preceded_by || v.not_followed_by) {
	  		itemsearch(searchstring).qualifiedFind(v.topic, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			if (error) {console.log('qualifiedFind ' + error); }
	  			if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				// console.log(results); 
	  				mentions.push.apply(mentions, results);
	  			}
	  		})
	  	}
	  	else {
	  		itemsearch(searchstring).easyFind(v.topic, function(error, results) {
	  			if (error) { console.log('easyFind ' + error); }
	  			else if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				mentions.push.apply(mentions, results);
	  			}
	  		});
	  	}
	  })
	  // console.log(mentions);
	  return mentions;
	}

});  // end of start function


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
				// console.log("Successfully added " + headline + ", ID#" + rows.insertId + " to article table."); 
				
				// return the unique id for the article as the insertArticle promise's resolution
				resolve(rows.insertId);  
				
			}, error => { console.error("The query promise has failed.", error); })
			.then( rows =>  db.close() )
			// .then( resolve(article_id) );
		
	});

}


function insertPlaceMention(place_id, article_id, relevance, context) {
	
	return new Promise(function(resolve, reject) {

		var q = "INSERT INTO place_mention (article_id, relevance_score, context, place_id) "
	 		+ "VALUES ('" + article_id + "','" + relevance + "','" + context + "','" + place_id + "')";

		var db = new Database; 

		db.query(q)
			.then( rows => { 
					// console.log("Successfully added search result to place_mention table."); 
					
					// return the unique id for the article as the insertArticle promise's resolution
					resolve(rows.insertId);  
					
				}, error => { console.error("The query promise has failed.", error); })
				.then( rows =>  db.close() );
	});

}
