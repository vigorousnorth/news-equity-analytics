const { Pool, Client } = require('pg');

require('dotenv').config

module.exports = (rss_id, itemObject) => {

	return new Promise(function(resolve, reject) {
		
		var headline = itemObject.title.replace(/'/g, "\\'");
		var summary = itemObject.summary.replace(/'/g, "\\'")
		var date = itemObject.date;

		var datestr = date.toISOString().slice(0, 19).replace('T', ' ');
		// console.log(datestr);

		var q = "INSERT INTO articles (feed_id, date, headline, summary, url) VALUES ('" 
			+ rss_id + "','" + datestr + "','" + headline
			+ "','" + summary + "','" + itemObject.link + "') RETURNING id;";
		
		var db = new Client({
			host: process.env.DB_HOST,
		  user: process.env.DB_USER,
		  password: process.env.DB_PASS,
		  database: process.env.DB
		});

		db.connect();

		db.query(q)
			.then( res => { 
				// return the unique id for the article as the insertArticle promise's resolution
				resolve(res.rows[0].id);  
				
			}, error => { console.error("The query promise has failed.", error); })
			.then( rows =>  db.end() );
		
	});

}