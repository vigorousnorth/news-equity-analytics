const { Pool, Client } = require('pg');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

var date = '2019-01-03'; // date variable to be customized later in API implementation
 
var nycQuery = `select array_to_json(array_agg(row_to_json(t)))
from (
 select placenames.id, placenames.placenames, place_demographics.population, geocodes.geocodes,
   (
     /* the inner query collects an array of article mentions, grouped by article, associated with each place/topic */
     select array_to_json(array_agg(row_to_json(d)))
     from (
       select count(place_mentions.place_id) as mentions_count, articles.url, articles.headline, articles.date, articles.feed_id
       FROM place_mentions
       INNER JOIN articles on articles.id = place_mentions.article_id
       where place_mentions.place_id = placenames.id and articles.date > '${date}'
       GROUP BY articles.url, articles.headline, articles.date, articles.feed_id
       ORDER BY articles.date DESC
     ) d
   ) as place_mentions
   from (
   select places.id, array_to_json(array_agg(place_aliases.place_name)) as placenames from places
     LEFT JOIN place_aliases on (places.id = place_aliases.place_id)
     GROUP BY places.id
   ) as placenames
   INNER JOIN place_demographics on (placenames.id = place_demographics.place_id)
   LEFT JOIN (
     select places.id, array_to_json(array_agg(place_geocodes.geocode)) as geocodes from places
     LEFT JOIN place_geocodes on (places.id = place_geocodes.place_id)
     GROUP BY places.id
   ) as geocodes on geocodes.id = placenames.id  
) t ;`;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  response.render('pages/index', { 'day' : new Date().toString().substr(0,10) })
});

app.get('/nyc_json', function (request, response) {
  
  //	HOSTED CONNECTION
 	 const db = new Client({
	  connectionString: process.env.DATABASE_URL,
	  ssl: true,
	});

	db.connect();

  db.query(nycQuery)
		.then( res => {

			response.json(res.rows[0].array_to_json);
						
			db.end();

	})

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

