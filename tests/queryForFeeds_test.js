
const expect = require('chai').expect;
const queryForFeeds = require('../lib/queryForFeeds');


describe('queryForFeeds()', function() {
	
	it('should return an array of feed URLs and market IDs from the SQL table', function() {

		// 1. ARRANGE
		let expected = { 
			id: 1,
	    url: 'https://www.pressherald.com/mailchimp-feed/',
	    market_id: 1,
	    structure: { 
	    	headline: 'title',
	      subhed: 'summary',
	      feedbody: 'description',
	      url: null,
	      scrapertag: null 
	    }
	  }

		// 2. ACT
	  let feedArray = queryForFeeds().then( function(response) {
	  	console.log(response);
	  	// 3. ASSERT
			expect(response[0]).to.be.equal(expected);
	  }, function(e) { console.log("queryForFeeds promise error.") });

	})

})