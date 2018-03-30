const searchMod = require('./itemSearch');

const start = require('./queryForTopics');
const queryForFeeds = require('./queryForFeeds');
const insertArticle = require('./insertArticle');
const insertPlaceMention = require('./insertPlaceMention')

const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;
const findElementByProp = searchMod.findElementByProp;

const getFeedContent = require('./feedparser');

const scraper = require('./articleScraper');

var searchItems = [], storyItems = [];

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
				// searchItems contains an array of topics grouped by market area
			}, function(error) { 
				console.log("The parseTheTopics promise has failed.", error); 
			})
		.then(function(response) {
				return queryForFeeds();
				// getFeedUrls returns a promise that resolves with an array of RSS feed IDs, market IDs and URLs.
			}, function(error) { 
				console.log("The queryForFeeds promise has failed", error); 
			})
		.then(function(urls) {

				var promiseArray = [];

				for (var i = 0;  i < urls.length;  i++) {
					if (urls[i].url) { promiseArray[i] = getFeedContent(urls[i].url); }
					// getFeedContent returns a promise that returns the array of RSS items when resolved.
				};

				return Promise.all(promiseArray).then( function(feeds) {
					var feedObj = feeds.map( function(v,i,a) {
						return {
							'id': urls[i].id, 
							'market_id' : urls[i].market_id, 
							'XML_structure' : urls[i].structure,
							'content': v
						}
					});
					return feedObj; 
					// an array of feeds containing arrays of feed article IDs
				}, error => { console.log("Failure in feedparser Promise.all()." + error ); });
				
			}, function(error) { 
				console.log("The feedparser promise has failed", error); 
			})
		.then(function(feeds) {
				console.log("Got the feeds.");
				
				var promiseArray = [];

				for (var i = 0;  i < feeds.length;  i++) {
					
					var feedItemArray = feeds[i].content,
					 marketArea = feeds[i].market_id,
					 rss_id = feeds[i].id,
					 XML_structure = feeds[i].XML_structure;

					for (var j = 0;  j < feedItemArray.length;  j++) {
						
						var article = feedItemArray[j];
						
						if (article) { 
							promiseArray.push(searchAndAdd(article, XML_structure, rss_id, marketArea)); 
						}
					}
				};
				
				return Promise.all(promiseArray).then( function(values) {
				  return values; // an array of article IDs
				}, error => { console.log("Failure in searchAndAdd Promise.all()." + error ); });
			
			}, function(error) {
		  	console.error("The getFeed promise has failed.", error);
			})
		.then(function(response) {
			response.sort(function(a, b){return (+a) - (+b)});
			console.log("Article IDs added: " + response);
		}, function(error) {console.error("The insertArticle promise has failed.", error); });


	async function searchAndAdd(article, XML_structure, rss_id, market) {
		
		let resultsPromises = [], article_id,
		thisMarketSearchGroup = findElementByProp(searchItems, "market", market),
		headline = article[XML_structure.headline],
		subhed = article[XML_structure.subhed],
		url = article[XML_structure.url],
		articlebody;

		let thisMarketSearchItems = thisMarketSearchGroup.searchterms;

		if (XML_structure.scrapertag) {
			var tag = XML_structure.scrapertag;
			try { articlebody = await scraper(url,tag); }
			catch (err) {console.log("articleScraper error: " + err); }
		}

		else {
			articlebody = article.description.replace(/<\/?[pa][^>]*>/g, "").replace(/'/g, "\\'");
		}

		headline.replace(/'/g, "\\'");  
		subhed.replace(/'/g, "\\'"); 

		var searchstring = headline + " | " + subhed + " | "
			+ articlebody;

		try { article_id = await insertArticle(rss_id, article); 
		} catch (err) {console.log("insertArticle error:" + err); }
		// insertArticle is a promise that returns the article's SQL table ID on resolve
		
		var article_results = await searchStory(searchstring, thisMarketSearchItems); 
		// returns an array of topic mentions from the article
		// each result is an object of the form {topic: topic name, id: id from the place_mentions table
		// index: position within the search string, and value: search result context }
		
		for (var j = article_results.length - 1; j >= 0; j--) {
			var thisHit = article_results[j];

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
  		
  		var str = v.alias ? v.name + "|" + v.alias : v.name;

	  	if (v.not_preceded_by || v.not_followed_by) {
	  		itemsearch(searchstring).qualifiedFind(str, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			if (error) {console.log('qualifiedFind ' + error); }
	  			if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				// console.log(results); 
	  				mentions.push.apply(mentions, results);
	  			}
	  		})
	  	}
	  	else {
	  		itemsearch(searchstring).easyFind(str, function(error, results) {

	  			if (error) { console.log('easyFind ' + error); }
	  			else if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				mentions.push.apply(mentions, results);
	  			}
	  		});
	  	}
	  })

	  return mentions;
	}

});  // end of start function

