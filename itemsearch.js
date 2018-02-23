function parseTopics(topics) {

	var topic_searchterms = [];

	topics.map(function(v,i,a) {

		var not_pre = [], not_post =[];

		// v.name = Amherst; v.but_not = "University of Massachusetts at Amherst, Amherst College"
		if (v.not_preceded_by || v.not_followed_by) {

			not_pre = (v.not_preceded_by && v.not_preceded_by != "") ? v.not_preceded_by.split(",") : [];
			not_post = (v.not_followed_by && v.not_followed_by != "") ? v.not_followed_by.split(",") : [];			
		}

		topic_searchterms.push({
			'topic' : v.name,
			'id' : v.id,
			'not_preceded_by' : not_pre,
			'not_followed_by' : not_post 
		});

	});

	for (var i = topics.length - 1; i >= 0; i--) {
		// Loop through the topics array for potentially ambiguous
		// matches (e.g. to distinguish Portland from South Portland
		// or Virginia from West Virginia
		var split = (topics[i].name).split(' ');

		//winnow down the potential duplicates
		if (split.length > 1) { 
			// console.log(split);
			for (var j = split.length - 1; j >= 0; j--) {
			 	// search for the string split[j] as a unique item 
			 	// in the rest of the topics array, separated by commas
			 	// e.g, for "South Portland" split[1] = 'Portland', split[0] = 'South', simiarTerm = the Portland search term object
			 	var similarTerm = findElementByProp(topic_searchterms, 'topic', split[j]);
			 
			 	if (similarTerm) {

			 		// topic_searchterms[ind].not_preceded_by = (j>0) ? split[j-1] : null;
			 		if (j>0 && split[j-1]) { 
			 			similarTerm.not_preceded_by.push(split[j-1]); 
			 		}
			 		if (j<split.length && split[j+1]) { 
			 			similarTerm.not_followed_by.push(split[j+1]); }
			 	}	
			};  // end of loop through split search term
		}
	};

	return topic_searchterms;

}

var itemsearch = function(item) {

	var sentences = item.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
	var storyLength = sentences.length;
	
	return {

		easyFind: function( regex, callback ) {
			if ( !regex || {}.toString.call( regex ) !== "[object String]" ) {
				callback( new TypeError( "You must provide a regular expression to search with." ) );
				return;
			}

			var results = [];

			sentences.map( function( value, index ) {
		          if ( value.match( new RegExp( regex, 'g' ) ) ) {
		            results.push( 
			            { 
			            	topic: regex, 
			            	index: ((index + 1)*100/storyLength).toFixed(0), 
			            	value: value 
			            } );
		          }
		    });

		    callback(null, results);
		},
		
		qualifiedFind: function( regex, pre, post, callback ) {
			// search for a regex term (topic name),
			// not preceded by strings in the 'pre' array 
			// and not followed by strings in the 'post' array

			if ( !regex || {}.toString.call( regex ) !== "[object String]" ) {
				callback( new TypeError( "You must provide a regular expression to search with." ) );
				return;
			}

			var results = [];

			sentences.map( function( value, index ) {
				
				var candidates = value.match( new RegExp( regex, 'g' ) );
				
				if (candidates) {
					// console.log(candidates);
					// Possible match in this sentence. Now check for the pre/post conditions: 
					
					// console.log("********* Searching for: " + regex);
					// console.log("********* in sentence: " + value);

					var cl = candidates.length;

					var sentence = value.split(regex);
					// split the sentence into an array containing the part before the match and the part after

					if (sentence[0] == ' ') {sentence.pop();}
					var l = sentence.length;

					sentence.map(function (v,i,a) {

						var lastpart = v;
						var nextpart = a[i+1] ? a[i+1] : null;
						
						if ((i = l) && (!nextpart) ) { 
							// console.log("End of sentence.");
							return null; 
						}

						else if ( pre && searchBackwards(lastpart,pre) ) 
							{
								// console.log("Reject this one: " + pre + ' found in "' + lastpart.substr(-8) + '"' );
								return null;
							}

						else if ( post && nextpart && searchForwards(nextpart, post) ) 
							{
								// console.log("Reject this one: " + post + ' found in "' + nextpart.substr(0,8) + '"' );
								return null;
							} 
						else {
							// console.log("-- This looks like one: " + lastpart + '***' + regex + '*** ' + nextpart );
							results.push( 
								{ 
									topic: regex, 
									index: ((index + 1)*100/storyLength).toFixed(0), 
									value: value 
								} );
						}

					}) 									
				}
		    });

		    callback(null, results);
		}		
	}
}

function searchBackwards(string, pre_array) {
	var match = false;
	for (var i = pre_array.length - 1; i >= 0; i--) {
		if (string.match( new RegExp( pre_array[i] + "\\s?$" , 'g') ) )
			{ match = true; break; }
		else continue;
	}
	return match;
}

function searchForwards(string, post_array) {
	var match = false;
	for (var i = post_array.length - 1; i >= 0; i--) {
		if (string.match( new RegExp( "^\\s?" + post_array[i] , 'g') ) )
			{ match = true; break; }
		else continue;
	}
	return match;
}

function findElementByProp(arr, propName, propValue) {
  var returnVal = null;
  for (var i=0; i < arr.length; i++) {
    if (arr[i][propName] === propValue) {
			returnVal = arr[i];
    }
  } 
  return returnVal;
}

module.exports.itemsearch = itemsearch;
module.exports.parseTopics = parseTopics;
 