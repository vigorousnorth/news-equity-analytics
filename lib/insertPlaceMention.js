const { Pool, Client } = require('pg');

require('dotenv').config

module.exports = (place_id, article_id, relevance, context) => {

	return new Promise(function(resolve, reject) {

		var q = "INSERT INTO place_mentions (article_id, relevance_score, context, place_id) "
	 		+ "VALUES ('" + article_id + "','" + relevance + "','" + context + "','" + place_id + "')";

	 	// console.log(q);

		const db = new Client({
		  connectionString: process.env.DATABASE_URL,
		  ssl: (process.env.NODE_ENV === 'local') ? false : true
		});
				
		db.connect();

		db.query(q)
			.then( rows => { 
					// console.log("Successfully added search result to place_mention table."); 
					
					// return the unique id for the article as the insertArticle promise's resolution
					resolve(rows.insertId);  
					
				}, error => { console.error("The insertPlaceMention promise has failed with the sentence " + context + ".", error); })
				.then( rows =>  db.end() );
	});

}