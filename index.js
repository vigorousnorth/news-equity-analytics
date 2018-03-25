const { Pool, Client } = require('pg');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

var nycQuery = "select array_to_json(array_agg(row_to_json(t)))	from ( 	  select place_name, geocode,	    (	      select array_to_json(array_agg(row_to_json(d)))	      from (	        select count(place_mentions.place_id) as mentions_count, articles.url	        FROM place_mentions	        INNER JOIN articles on articles.id = place_mentions.article_id	        where place_mentions.place_id = places.id 																				GROUP BY articles.url, articles.headline					      ) d	    ) as place_mentions	  from places	  where market_id = 2	) t";

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/nyc_json', function (request, response) {
  //	HOSTED CONNECTION
 	 const db = new Client({
	  connectionString: process.env.DATABASE_URL,
	  ssl: true,
	});

	// LOCAL CONNECTION
	// var db = new Client({
	// 	host: process.env.DB_HOST,
	//   user: process.env.DB_USER,
	//   password: process.env.DB_PASS,
	//   database: process.env.DB
	// });

	db.connect();

  db.query(nycQuery)
		.then( res => {

			response.json(res.rows);
						
			db.end();

	})

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

