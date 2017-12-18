var ready = false;
var config = require('./config'); 
	// contains target feed, target RSS tags and analytics terms

var topics = config.topics;

function parseTopics(callback) {

	var topic_searchterms = [];

	topics.map(function(v,i,a) {
		topic_searchterms.push({
				'topic' : v,
				'not_preceded_by' : '',
				'not_followed_by' : ''  
				// Add additional functionality here later, to allow users additional flexibility in defining/refining search terms
				// (e.g., search for 'Guinness' but not 'Alec Guinness')
			});
	});

	for (var i = topics.length - 1; i >= 0; i--) {
		// Loop through the topics array for potentially ambiguous
		// matches (e.g. to distinguish Portland from South Portland
		// or Virginia from West Virginia
		var split = topics[i].split(' ');

		//winnow down the potential duplicates

		if (split.length > 1) { 
			for (var j = split.length - 1; j >= 0; j--) {
			 	// search for the string split[j] as a unique item 
			 	// in the rest of the topics array, separated by commas
			 	var ind = topics.indexOf(split[j]); 
			 	if (ind > -1) {
			 		topic_searchterms[ind].not_preceded_by = (j>0) ? split[j-1] : null;
			 		topic_searchterms[ind].not_followed_by = (j<split.length) ? split[j+1] : null;
			 	}	
			};  // end of loop through split search term
		}
		ready = true;
	};

	callback(null, topic_searchterms);

}

var itemsearch = function(item) {
	return {
		find: function( regex, cb ) {
			if ( !regex || {}.toString.call( regex ) !== "[object String]" ) {
				callback( new TypeError( "You must provide a regular expression to search with." ) );
				return;
			}

			var results = [];

			item.match(/\(?[^\.\?\!]+[\.!\?]\)?/g).map( function( value, index ) {
		          if ( value.match( new RegExp( regex, 'g' ) ) ) {
		            results.push( { topic: regex, index: index + 1, value: value } );
		          }
		    });

		    cb(null, results);
		},
		
		qualifiedFind: function( regex, pre, post, cb ) {
			// search for a regex term not preceded by the 'pre' string and not followed by the 'post' string
			if ( !regex || {}.toString.call( regex ) !== "[object String]" ) {
				callback( new TypeError( "You must provide a regular expression to search with." ) );
				return;
			}

			var results = [];

			item.match(/\(?[^\.\?\!]+[\.!\?]\)?/g).map( function( value, index ) {
				
				if ( value.match( new RegExp( regex, 'g' ) ) ) {
					
					// Possible match in this sentence. Now check for the pre/post conditions: 
					var sentence = value.split(' ');
					if (sentence[0] == ' ') {sentence.pop();}
					var reg_array = regex.split(' ');
					
					// console.log('Possible match here!');

					sentence.map(function (v,i,a) {

						// console.log("v: " + v);
						if (v.match( new RegExp( reg_array[0], 'g') ) ) {
							
							if ( !reg_array[1] || (a[i+1]).match( new RegExp( reg_array[1] , 'g') ) ) {
								
								// Continue; the next word in the sentence matches the next word in the search expression
								if ( ( pre && a[(i-1)] && (a[(i-1)]).match( new RegExp( pre , 'gi') ) ) ||
									 ( post && a[(i+1)] && (a[(i+1)]).match( new RegExp( post , 'gi') ) )
								) {
									// console.log("Reject this one: " + a[(i-1)] + a[(i)] + a[(i+1)] );
									
								} else {
									results.push( { topic: regex, index: index + 1, value: value } );
								}
							}
						}
					}) 									
				}
		    });

		    cb(null, results);
		}		
	}
}

// var teststring = "In South Portland. And also not Portland West or bash Portland. But not South Portland, or Westbrook. Not South Portland. But not anti-Portland. But sure in South Portland."

// console.log( teststring.match( new RegExp("South Portland", 'g')));
// itemsearch(teststring).find('South Portland', function(err, results) {
// 	console.log(results);
// })

module.exports.itemsearch = itemsearch;
module.exports.parseTopics = parseTopics;
 