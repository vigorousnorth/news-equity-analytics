
const expect = require('chai').expect;
const searchMod = require('./itemsearch_working');


const itemsearch = searchMod.itemsearch;
const list = searchMod.parseTopics;

describe('searchtopics()', function() {
	
	it('should return a list of place mentions', function() {

		const topics = [
			{topic:"Freedom", id: 512, [], ["of Access"]},
			{topic:"Union", id: 312, ["Civil Liberties","labor"], []},
			{topic:"York", id: 609, ["New"], []},
			{topic:"Portland", id: 191, ["South","New"], []},
			{topic:"South Portland", id: 196, [], []},
			{topic:"Falmouth", id: 180, [], []},
			{topic:"Limington", id: 596, [], []},
			{topic:"Berwick", id: 584, ["North","South"], []},
			{topic:"South Berwick", id: 606, [], []}
		];

		const searchstring = "Swallow has recruited players to New York from across the country, and Canada and England, but there are seven Maine players. Besides Fleurent, the roster features Alden Weller (Falmouth), Jason Harmon (Limington), Ian Rodden (Berwick), Neil Maietta (South Portland), Payton Porter (York) and Samuel Michaud (South Portland).";

		const expectedResults = ["Falmouth","Limington","Berwick","South Portland","York","South Portland"];

			
		var mentions = [];
		
	  topics.map(function(v,j,a) {

	  	if (v.not_preceded_by || v.not_followed_by) {
	  		itemsearch(searchstring).qualifiedFind(v.topic, v.not_preceded_by, v.not_followed_by, function(error, results) {
	  			if (error) {console.log('qualifiedFind ' + error); }
	  			if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				// console.log(results); 
	  				mentions = results;
	  			}
	  		})
	  	}
	  	else {
	  		itemsearch(searchstring).easyFind(v.topic, function(error, results) {
	  			if (error) { console.log('easyFind ' + error); }
	  			else if (results[0]) { 
	  				results.map( val => { val.place_id = v.id; return val; });
	  				mentions = results;
	  			}
	  		});
	  	}
	  });

	  results = mentions.map( v => v.topic );

		// 3. ASSERT
		expect(expectedResults).to.be.equal(results);

	})

})