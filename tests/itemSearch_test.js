
const expect = require('chai').expect;
const searchMod = require('../lib/itemsearch');


const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;


describe('searchtopics()', function() {
	
	it('should return a list of place mention ids from the search string', function() {

		// 1. ARRANGE
		const topics = [
			{	"name":"Elmhurst", "alias" : "Maspeth", "id": 640, "market_id" : 2,
				"not_preceded_by" : ["East"] , "not_followed_by" : [] 
			},
			{	"name":"East Elmhurst", "alias" : null, "id": 638, "market_id" : 2,
				"not_preceded_by" : [] , "not_followed_by" : [] 
			},
			{	"name":"Brooklyn",  "alias" : "Kings County", "id": 520, "market_id" : 2,
				"not_preceded_by" : ["Downtown"], "not_followed_by" : ["Bridge","Nets","Heights"] 
			},
			{	"name":"Manhattan",  "alias" : null, "id": 522, "market_id" : 2,
				"not_preceded_by" : ["Lower"], "not_followed_by" : ["Bridge","Beach"] 
			},
			{	"name":"Brooklyn Heights", "alias" : "Cobble Hill", "id": 557, "market_id" : 2,
				"not_preceded_by" : [], "not_followed_by" : [] 
			},
			{	"name":"Downtown Brooklyn", "alias" : "DUMBO", "id": 571, "market_id" : 2,
				"not_preceded_by" : [], "not_followed_by" : [] 
			},
			{	"name":"Battery Park City", "alias" : "Lower Manhattan", "id": 613, "market_id" : 2,
				"not_preceded_by" : [], "not_followed_by" : [] 
			},
			{	"name":"Sheepshead Bay", "alias" : "Manhattan Beach", "id": 558, "market_id" : 2,
				"not_preceded_by" : [], "not_followed_by" : [] 
			},
		];

		const searchstring = "New York's Manhattan Beach neighborhood is located at the southern edge of Brooklyn." 
			+ " Besides Fleurent, the roster features Alden Weller (Falmouth), who played in Battery Park," 
			+ " Jason Harmon of Brooklyn Heights, and Ian Rodden (of East Elmhurst)." 
			+ " The Brooklyn Heights Promenade has stunning views of the harbor and Brooklyn Bridge.";

		const expectedResults = [638, 520, 557, 557, 558 ];
		// expected results are returned in the order in which they're listed in the topics array, as many times as they're found in the search string.

			
		var mentions = [];

		// 2. ACT

	  topics.map(function(v,j,a) {

	  	if (v.not_preceded_by[0] || v.not_followed_by[0]) {
	  		var str = v.alias ? v.name + "|" + v.alias : v.name;
	  		itemsearch(searchstring)
	  			.qualifiedFind(str, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			
		  			if (error) {console.log('qualifiedFind ' + error); }
		  			console.log(results);
		  			if (results[0]) { 
		  				results.map( val => { console.log(val); console.log('QF success:' + v.id); val.place_id = v.id; return val; });
		  				mentions.push.apply(mentions, results);
		  			}

	  			})
	  	}
	  	else {
	  		var str = v.alias ? v.name + "|" + v.alias : v.name;
	  		itemsearch(searchstring).easyFind(str, function(error, results) {
	  			if (error) { console.log('easyFind ' + error); }
	  			else if (results[0]) { 
	  				results.map( val => { console.log(val); console.log('EF success:' + v.id); val.place_id = v.id; return val; });
	  				mentions.push.apply(mentions, results);
	  			}
	  		});
	  	}
	  });

	  var towns = mentions.map( v => { return v.place_id	; } );
	  
	  console.log(towns);


		// 3. ASSERT
		for (var i = towns.length - 1; i >= 0; i--) {
			expect(towns[i]).to.be.equal(expectedResults[i]);
		};
		

	})

})