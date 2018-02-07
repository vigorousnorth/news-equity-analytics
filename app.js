
const rssMod = require('./feedparser') 
	// for fetching the feed
const config = require('./config'); 
	// contains definations for the target feed, target RSS tags, analytics terms, SQL connection

const searchMod = require('./itemsearch');
const sqlMod = require('./sqlConnection');

const start = searchMod.fetchTopics;
const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;
const getFeed = rssMod.getFeed;
	//getFeed is a promise that takes a URL argument and resolves with an array of RSS items

var searchItems = [], storyItems = [];

	// regular expression search functions are in here
const connect = sqlMod.connect;

var url = config.feed;

console.log(url);

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
				console.log("Topics parsed.");
				searchItems = response;
				// console.log(searchItems[39]);
			}, function(error) { 
				console.log("The parseTheTopics promise has failed.", error); 
			})
		.then(function(response) {
				return getFeed(url); // Promises the array of RSS items as the response.
			})
		.then(function(response) {
				console.log("Success: got the feed.");

				storyItems = response; 

			  searchStories(storyItems);			  

			}, function(error) {
		  	console.error("The getFeed promise has failed.", error);
			});

});

function searchStories(storyArray) {

	for (var i = storyArray.length - 1; i >= 0; i--) {
	
		item = storyArray[i];

  	// This is the loop where RSS article items are processed and searched for insertion into our database.
    
    var hed = item.title ? item.title : '';
    var subhed = item.summary ? item.summary : '';
    var story = item.description ? item.description : ''; // story content
    
    // we can score the 'strength' of each topic mention by scoring it
    // according to how high up in each item it is
    story_l = story? story.split(' ').length : 0;
    subhed_l = subhed ? subhed.split(' ').length : 0;
    hed_l = hed ? hed.split(' ').length : 0;
    
    var itemObj = { 
    	'permalink' : item.link,
    	'pubdate' : item.pubdate,
    	'hed_index' : [0,hed_l],
    	'subhed_index' : [hed_l,subhed_l],
    	'body_index' : [(hed_l + subhed_l), (hed_l + subhed_l + story_l)],
    	'topics' : [],
			'searchstring' : hed + "|" + subhed + "|" + story
		}
    

    console.log(i + "," + itemObj);

    // In here, call the "itemsearch" function from itemsearch.js on each item.
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

}
