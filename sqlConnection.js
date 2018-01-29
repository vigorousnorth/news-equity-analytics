var mysql = require('mysql');
var config = require('./config');
	// for saving the results to a queryable table
// Stuff for our SQL database (to do later)...

class Database {

	constructor() {
		this.connection = mysql.createConnection({
		  host: config.sql_host,
		  user: config.sql_user,
		  password: config.sql_password,
		  database: 'mydb'
		});
	}

	query( sql, args ) {
		return new Promise ( (resolve, reject) => {
			this.connection.query( sql, args, (err, rows) => {
				if (err) return reject(err);
				resolve(rows);
			});
		});
	}

	close() {
		return new Promise( (resolve, reject ) => {
			this.connection.end(err => {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}



// var db;

// function connect() {

// 	if (!db) {

// 		db = mysql.createConnection({
// 		  host: config.sql_host,
// 		  user: config.sql_user,
// 		  password: config.sql_password,
// 		  database: 'mydb'
// 		});

// 		db.connect(function(err) {
// 		  if (err) throw err;
// 		  else { console.log("Successful SQL connection!"); }
// 		});

// 	}

// 	return db;

// }

module.exports = Database;