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
		
		const db = new Client({
		  connectionString: process.env.DATABASE_URL,
		  ssl: (process.env.NODE_ENV === 'local') ? false : true
		});
		
		db.connect();

		db.query(q)
			.then( res => { 
				// return the unique id for the article as the insertArticle promise's resolution
				resolve(res.rows[0].id);  
				
			}, error => { console.error("The insertArticle promise has failed.", error); })
			.then( rows =>  db.end() );
		
	});

}