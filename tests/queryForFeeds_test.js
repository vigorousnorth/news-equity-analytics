
const expect = require('chai').expect;
const queryForFeeds = require('../lib/queryForFeeds');
const isEquivalent = require('../lib/isEquivalent');



describe('queryForFeeds() resolves', (done) => {
	
	it('should return an array of feed URLs and market IDs from the SQL table', async () => {

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
	  	const feedArray = await queryForFeeds();

	  	// 3. ASSERT
		expect(isEquivalent(feedArray[0], expected));
	  	// expect(feedArray[0]).to.equal(expected);

	});

})