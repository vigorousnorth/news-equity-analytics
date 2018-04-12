const { Pool, Client } = require('pg');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

var nycQuery = `select array_to_json(array_agg(row_to_json(t)))
from (
  select place_name, geocode, place_demographics.population, 
    (
      /* the inner query collects an array of article mentions, grouped by article, associated with each place/topic */
      select array_to_json(array_agg(row_to_json(d)))
      from (
        select count(place_mentions.place_id) as mentions_count, articles.url, articles.headline, articles.date, articles.feed_id
        FROM place_mentions
        INNER JOIN articles on articles.id = place_mentions.article_id
        where place_mentions.place_id = places.id 
        GROUP BY articles.url, articles.headline, articles.date, articles.feed_id 
        ORDER BY articles.date DESC
      ) d
    ) as place_mentions
  from places 
  INNER JOIN place_demographics on (places.id = place_demographics.place_id) 
  where places.market_id = 2
) t`;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  response.render('pages/index', { day : "April 12, 2018" })
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

