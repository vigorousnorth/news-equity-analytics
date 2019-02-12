
const { Pool, Client } = require('pg');

const isEquivalent = require('../lib/isEquivalent');

require('dotenv').config();

var feeds;

module.exports = () => {

	return new Promise(function (resolve, reject) {

		var q = "SELECT feeds.id, feeds.url, feeds.xml_headline_tag, feeds.xml_subhed_tag,"
		  + " feeds.xml_article_tag, feeds.xml_permalink_tag, feeds.scraper_article_tag, publishers.market_id" 
		  + " FROM feeds" 
		  + " INNER JOIN publishers ON feeds.publisher_id = publishers.id;";
		
		const db = new Client({
		  connectionString: process.env.DATABASE_URL,
		  ssl: (process.env.NODE_ENV === 'local') ? false : true
		});
		
		db.connect();
			
		db.query(q)
			.then( res => {
				feeds = (res.rows).map( function(v) {
					return {
						'id' : v.id,
						'url' : v.url,
						'market_id' : v.market_id,
						'structure' : {
							'headline' : 	v.xml_headline_tag,
							'subhed' : 		v.xml_subhed_tag,
							'feedbody' : 	v.xml_article_tag,
							'url' : 		v.xml_permalink_tag,
							'scrapertag': 	v.scraper_article_tag
						}
					}
				});
			})
			.then( res =>  db.end() )
			.then( function() { resolve(feeds) })
			
	
	}).catch( error => { console.log("Query promise error:", error); });	
}