
const expect = require('chai').expect;
const searchMod = require('../itemsearch_working');


const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;


describe('searchtopics()', function() {
	
	it('should return a list of place mentions', function() {

		const topics = [
			{"topic":"Freedom", "id": 512, "not_preceded_by" : [] , "not_followed_by" : ["of Access"]},
			{"topic":"Union", "id": 312, "not_preceded_by" : ["Civil Liberties","labor"], "not_followed_by" : []},
			{"topic":"York", "id": 609, "not_preceded_by" : ["New"], "not_followed_by" : []},
			{"topic":"Portland", "id": 191, "not_preceded_by" : ["South","New"], "not_followed_by" : []},
			{"topic":"South Portland", "id": 196, "not_preceded_by": [], "not_followed_by" : []},
			{"topic":"Falmouth", "id": 180, "not_preceded_by" : [], "not_followed_by" : []},
			{"topic":"Limington", "id": 596, "not_preceded_by": [], "not_followed_by" : []},
			{"topic":"Berwick", "id": 584, "not_preceded_by" : ["North","South"], "not_followed_by" : []},
			{"topic":"South Berwick", "id": 606, "not_preceded_by": [], "not_followed_by" : []}
		];

		const searchstring = "Swallow has recruited players to New York from across the country, and Canada and England, but there are seven Maine players in the labor union. Besides Fleurent, the roster features Alden Weller (Falmouth), Jason Harmon of Limington, Ian Rodden (of York and Berwick), Neil Maietta (South Portland), Payton Porter (York) and Samuel Michaud (Portland).";

		const expectedResults = ["York", "York", "Portland", "South Portland","Falmouth","Limington","Berwick"];

			
		var mentions = [];

	  topics.map(function(v,j,a) {

	  	if (v.not_preceded_by[0] || v.not_followed_by[0]) {
	  		itemsearch(searchstring).qualifiedFind(v.topic, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			if (error) {console.log('qualifiedFind ' + error); }
	  			if (results[0]) { 
	  				console.log(results);
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
	  });

	  var towns = mentions.map( v => v.topic );

		// 3. ASSERT
		expect(expectedResults).to.be.equal(towns);

	})

})