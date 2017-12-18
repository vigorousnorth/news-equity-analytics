var mysql = require('mysql');
var config = require('./config');
	// for saving the results to a queryable table
// Stuff for our SQL database (to do later)...


function connect(callback) {

	var con = mysql.createConnection({
	  host: config.sql_host,
	  user: config.sql_user,
	  password: config.sql_password,
	  database: 'mydb'
	});

	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Successful SQL connection!");
	});

	callback(null, con)
}

module.exports.connect = connect;