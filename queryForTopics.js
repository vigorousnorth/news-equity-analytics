var config = require('./config'); 
	// contains target feed, target RSS tags and analytics terms

var Database = require('./sqlConnection');

var topics;

module.exports = (callback) => {

	var q = "SELECT id, Name, not_preceded_by, not_followed_by FROM places;"

	var db = new Database; 

	db.query(q)
		.then( rows => {
			topics = rows.map( function(v) {
				return {
					'name': v.Name,
					'id' : v.id,
					'not_followed_by' : v.not_followed_by,
					'not_preceded_by' : v.not_preceded_by
				}
			});
		})
		.then( rows =>  db.close() )
		.then( function() { callback( null, topics ) });

}