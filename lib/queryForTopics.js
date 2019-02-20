const { Pool, Client } = require('pg');

require('dotenv').config();

var topics;

module.exports = (callback) => {

	var q = "SELECT places.id, place_aliases.place_name, place_aliases.not_preceded_by, place_aliases.not_followed_by, places.market_id FROM places"
        + " INNER JOIN place_aliases ON places.id = place_aliases.place_id;"

	const db = new Client({
	  connectionString: process.env.DATABASE_URL,
	  ssl: (process.env.NODE_ENV === 'local') ? false : true
	});

	db.connect();

	db.query(q)
		.then( res => {

			topics = (res.rows).map( function(v) {
				return {
					'name': v.place_name,
					'alias': v.place_aliases,
					'id' : v.id,
					'not_followed_by' : v.not_followed_by,
					'not_preceded_by' : v.not_preceded_by,
					'market_id' : v.market_id
				}
			});
			
			db.end();

		})
		// .then( res =>  resolve(db.end()) )
		.then( function() { callback( null, topics ) });

}

