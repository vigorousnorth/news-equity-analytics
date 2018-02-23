var Database = require('./sqlConnection');

var feeds;

module.exports = () => {

	return new Promise(function (resolve, reject) {

		var q = "SELECT id, rss_url FROM rss_sources;"

		var db = new Database; 

		db.query(q)
			.then( rows => {
				feeds = rows.map( function(v) {
					return {
						'id' : v.id,
						'url' : v.rss_url
					}
				});
			})
			.then( rows =>  db.close() )
			.then( function() { resolve(feeds) });
	
	});

}