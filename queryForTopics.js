const { Pool, Client } = require('pg');

require('dotenv').config();

var topics;

module.exports = (callback) => {

	var q = "SELECT id, place_name, place_aliases, not_preceded_by, not_followed_by, market_id FROM places;"
	
	var db = new Client({
		host: process.env.DB_HOST,
	  user: process.env.DB_USER,
	  password: process.env.DB_PASS,
	  database: process.env.DB
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

