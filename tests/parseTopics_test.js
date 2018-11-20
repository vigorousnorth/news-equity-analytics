
const expect = require('chai').expect;
const searchMod = require('../lib/itemsearch');

const parseTopics = searchMod.parseTopics;

describe('parseTopics()', function() {
	
	it("should add qualifiers to each topic's 'not_followed_by' and 'not_preceded_by' properties, based on similarly-named topics in the list", function() {

		// 1. ARRANGE
		const topics = [
			{"name":"Elmhurst", "alias" : "Maspeth", "id": 640, "market_id":2,
				"not_preceded_by" : null, "not_followed_by" : null,
			},
			{"name":"East Elmhurst", "alias" : null, "id": 638, "market_id":2,
				"not_preceded_by" : null , "not_followed_by" : null 
			},
			{"name":"Brooklyn",  "alias" : "Kings County", "id": 520, "market_id":2, 
				"not_preceded_by" : null, "not_followed_by" : "Bridge,Nets" 
			},
			{"name":"Manhattan",  "alias" : null, "id": 522, "market_id":2,
				"not_preceded_by" : null, "not_followed_by" : "Bridge" 
			},
			{"name":"Brooklyn Heights", "alias" : "Cobble Hill", "id": 557, "market_id":2,
				"not_preceded_by" : null, "not_followed_by" : null 
			},
			{"name":"Downtown Brooklyn", "alias" : "DUMBO", "id": 557, "market_id":2,
				"not_preceded_by" : null, "not_followed_by" : null 
			},
			{"name":"Battery Park City", "alias" : "Lower Manhattan", "id": 613, "market_id":2,
				"not_preceded_by" : null, "not_followed_by" : null 
			},
			{"name":"Sheepshead Bay", "alias" : "Manhattan Beach", "id": 558, "market_id":2, 
				"not_preceded_by" : null, "not_followed_by" : null 
			},
		];

		const expected = [
			// {	"name":"Elmhurst", "alias" : "Maspeth", "id": 640, 
			// 	"not_preceded_by" : ["East"] , "not_followed_by" : [] 
			// },
			{	"name":"East Elmhurst", "alias" : null, "id": 638, 
				"not_preceded_by" : [] , "not_followed_by" : [] 
			},
			{	"name":"Brooklyn",  "alias" : "Kings County", "id": 520, 
				"not_preceded_by" : ["Downtown"], "not_followed_by" : ["Bridge","Nets","Heights"] 
			},
			// {	"name":"Manhattan",  "alias" : null, "id": 522, 
			// 	"not_preceded_by" : ["Lower"], "not_followed_by" : ["Bridge","Beach"] 
			// },
			// {	"name":"Brooklyn Heights", "alias" : "Cobble Hill", "id": 557, 
			// 	"not_preceded_by" : [], "not_followed_by" : [] 
			// },
			// {	"name":"Downtown Brooklyn", "alias" : "DUMBO", "id": 557, 
			// 	"not_preceded_by" : [], "not_followed_by" : [] 
			// },
			// {	"name":"Battery Park City", "alias" : "Lower Manhattan", "id": 613, 
			// 	"not_preceded_by" : [], "not_followed_by" : [] 
			// },
			{	"name":"Sheepshead Bay", "alias" : "Manhattan Beach", "id": 558, 
				"not_preceded_by" : [], "not_followed_by" : [] 
			}
		];
			
		function isEquivalent(a, b) {
			// Create arrays of property names
			var aProps = Object.getOwnPropertyNames(a);
			var bProps = Object.getOwnPropertyNames(b);

			if (aProps.length != bProps.length) { return false; }

			for (var i = 0; i < aProps.length; i++) {
				var propName = aProps[i]; 
				if (a[propName] !== b[propName]) { return false; }
			}

			return true;
		}

		// 2. ACT
		var parsedTopicMarkets = parseTopics(topics)
		var parsedSearchTerms = parsedTopicMarkets[0].searchterms;


		// 3. ASSERT
		expect(isEquivalent(parsedSearchTerms, expected));

	})

})