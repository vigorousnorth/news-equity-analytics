function parseTopics(topics) {

	var topic_searchterms = [];

	topics.map(function(v,i,a) {
		topic_searchterms.push({
				'topic' : v.name,
				'id' : v.id,
				'not_preceded_by' : null,
				'not_followed_by' : null  
			});
	});

	for (var i = topics.length - 1; i >= 0; i--) {
		// Loop through the topics array for potentially ambiguous
		// matches (e.g. to distinguish Portland from South Portland
		// or Virginia from West Virginia
		var split = (topics[i]['name']).split(' ');

		//winnow down the potential duplicates

		if (split.length > 1) { 
			for (var j = split.length - 1; j >= 0; j--) {
			 	// search for the string split[j] as a unique item 
			 	// in the rest of the topics array, separated by commas
			 	var ind = findByAttr(topics, 'name', split[j]); 
			 	if (ind > -1) {
			 		topic_searchterms[ind].not_preceded_by = (j>0) ? split[j-1] : null;
			 		topic_searchterms[ind].not_followed_by = (j<split.length) ? split[j+1] : null;
			 	}	
			};  // end of loop through split search term
		}
	};

	return topic_searchterms;

}

var itemsearch = function(item) {

	//item is a search string; sentences is an array of sentences from the item
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
		            results.push( { topic: regex, index: (index + 1)*100/storyLength, value: value } );
		          }
		    });

		    callback(null, results);
		},
		
		qualifiedFind: function( regex, pre, post, callback ) {
			// search for a regex term not preceded by the 'pre' string and not followed by the 'post' string
			if ( !regex || {}.toString.call( regex ) !== "[object String]" ) {
				callback( new TypeError( "You must provide a regular expression to search with." ) );
				return;
			}

			var results = [];

			sentences.map( function( value, index ) {
				
				if ( value.match( new RegExp( regex, 'g' ) ) ) {
					
					// Possible match in this sentence. Now check for the pre/post conditions: 
					var words = value.split(' ');
					if (words[0] == ' ') {words.pop();}
					var reg_array = regex.split(' ');
					
					// console.log('Possible match here!');

					words.map(function (v,i,a) {

						// console.log("v: " + v);
						if (v.match( new RegExp( reg_array[0], 'g') ) ) {
							
							if ( !reg_array[1] || (a[i+1]).match( new RegExp( reg_array[1] , 'g') ) ) {
								
								// Continue; the next word in the sentence matches the next word in the search expression
								if ( ( pre && a[(i-1)] && (a[(i-1)]).match( new RegExp( pre , 'gi') ) ) ||
									 ( post && a[(i+1)] && (a[(i+1)]).match( new RegExp( post , 'gi') ) )
								) {
									// console.log("Reject this one: " + a[(i-1)] + a[(i)] + a[(i+1)] );
									
								} else {
									results.push( { topic: regex, index: (index + 1)*100/storyLength, value: value } );
								}
							}
						}
					}) 									
				}
		    });

		    callback(null, results);
		}		
	}
}

function findByAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}


module.exports.itemsearch = itemsearch;
module.exports.parseTopics = parseTopics;
 