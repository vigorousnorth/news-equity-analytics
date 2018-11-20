# news-equity-analytics
Tools to analyze news feeds for equity in coverage.

This is a Node.js package to parse a news organization's RSS feeds and analyze its text for arrays of key topics – whether they're towns, or politicians, or sports teams – to generate data on how equitably journalism institutions allocate their attention.

Results are saved in a PostgreSQL database described by the `database.sql` file. This code can be run locally, or scheduled to run daily on a hosted Node.js server.  


## LOCAL INSTALLATION 

This app can be run locally. To do so, you'll need [have Node.js and npm installed locally](https://nodejs.org/en/download/), plus [a local PostgreSQL database](https://medium.freecodecamp.org/how-to-get-started-with-postgresql-9d3bc1dd1b11). 

Clone the repository to your hard drive by running these commands in your command shell or terminal:

```
$ git clone https://github.com//vigorousnorth/news-equity-analytics.git
$ cd news-equity-analytics
```

### Setting up your database

This software uses PostgreSQL database to save records of when and where specific topics are mentioned in news feeds of interest. The database is described by the `database.sql` file, which can be imported from the command line to set up all the nececssary tables. Here's a quick, plain-english guide to the most important tables we're setting up:

###### feeds
The `feeds` table includes information about the RSS feeds we're scraping, including URLs, a publisher ID that links to the `publishers` table, and XML information.

###### places
The `places` table describes the topics we're searching for in each news story. Generally these are names of cities, towns or neighborhoods, but this table could also be used to include lists of people, sports teams or other topics of interest. 

Each entry includes a column for potential aliases and disambiguation columns (`not_followed_by` and `not_preceded_by`) to filter out unwanted matches (for instance, to find mentions of "Brooklyn" but not "Brooklyn Nets" or "Brooklyn Bridge, the comma-separated string "Nets,Bridge" would be included in the `not_followed_by` column for Brooklyn).

###### media_markets and publishers
These tables exist to relate RSS feeds to different publishers or media markets.

`publishers` identifies parent news organizations and relates them to specific feeds in our `feeds` table. We're using this table because you may wish to analyze multiple RSS feeds from a single corporate owner – for instance, to compare coverage in the New York Times real estate section vs. the New York Times arts section. 

`media_markets` is a two-column table that exists to group together multiple feeds from a single media market for comparison purposes. The `id` column is referenced from the `publishers` table. 

###### articles
A table of individual news articles, including columns for the `headline`, `date`, `byline` and `url`. The `feed_id` column references the corresponding id from the `feeds` table.

The `url` column performs as a unique key, so that duplicate values of one article at the same url are not allowed.

###### place_mentions
This table is what we're most interested in: it contains one row for every time a topic in the `places` table is mentioned in an article from the `articles` table – basically a table of search results.

It includes 4 columns besides the unique `id` for each row: an `article_id` column that references the corresponding article from the `article` table; a `relevance_score` column, which roughly measures how prominent the mention is (a score of 100 means that the mention is included in the headline; a score of 1 means that the mention is in the very last sentence of the article); a `context` column that includes the sentence where the mention was found; and a `place_id` column that references the `places` table. 


Now that you know the rough structure of the database we're using, let's get it set up on your hard drive. First, test your local PostgreSQL database connection:

```
$ postgresql://localhost/postgres?user=[ your user name ]&password=[ your password ]
```

You should see something like this: 

```
$ psql (10.3)
Type "help" for help.
```

... which specifies the version of your local PostgreSQL installation and displays a shell command line where you can run queries of your database. If it's working, type `\q` to quit the shell. 

If it's not working, [make sure you've got PostgreSQL installed and running locally, and double-check your connection credentials](https://medium.freecodecamp.org/how-to-get-started-with-postgresql-9d3bc1dd1b11). 

Create an empty database named "postgres", then import the database structure:

```
$ createdb -T template0 postgres
$ psql postgres < database.sql
```

You should see a bunch of `CREATE TABLE` and `ALTER TABLE` messages. 

Let's connect to the `postgres` database from our command line and see if it worked. We'll type `psql postgres` to connect to the `postgres` database using the `psql` interactive terminal, then we'll use the `\d` command to see a list of all the tables in the database:

```
$ psql postgres

postgres-# \d
                  List of relations
 Schema |         Name          |   Type   |  Owner   
--------+-----------------------+----------+----------
 public | articles              | table    | [your user name here]
 public | articles_id_seq       | sequence |
 public | feeds                 | table    | 
 public | feeds_id_seq          | sequence | 
 public | media_markets         | table    | 
 public | media_markets_id_seq  | sequence | 
 public | place_mentions        | table    | 
 public | place_mentions_id_seq | sequence | 
 public | places                | table    | 
 public | places_id_seq         | sequence | 
 public | publishers            | table    | 
 public | publishers_id_seq     | sequence | 
 public | region_relations      | table    | 
(13 rows)
```

If that's what you're seeing, your database is all set up.

### Connecting your software to your database

We're using the dotenv package to manage database connections and credentials. For a local installation, create a new text file inside the `news-equity-analytics` directory like this one:

```
DB_HOST=127.0.0.1
DB=postgres
DATABASE_URL=postgresql://localhost/postgres?user=[your database user name]&password=[your database password]
NODE_ENV=local
```

and save the file as `.env` (you'll use different environment variables if and when you install this software on a hosted server with another database).


### A test run

Our Node.js app (in `/bin/app.js`) runs as a series of asynchronous functions in a chain of promises:

1. First, the callback to the `start` function loads the `lib/queryForTopics.js` file, which connects to the database and returns an array of objects that describe the contents of the `places` table.
2. Then, a chain of promises inside the `start()` function consumes the array of search topics and prepares them for searching by grouping them by media market and adding disambiguation properties (to distinguish East Flatbush from Flatbush, for instance)
3. Then, a new `queryForFeeds()` promise described in `lib/queryForFeeds.js` requests the list of RSS feeds from our pSQL database and resolves with an array of RSS feeds;
4. Then, the getFeedsContent() promise described in `lib/feedparser.js` returns an array of items (articles) from each RSS feed;
5. Then, with a nested array of feeds containing arrays of content to search, the app then loops through each article item and calls the asynchronous `searchAndAdd()` function on each one:
  1. The `searchAndAdd()` function first attempts to inset the unique article id into the pSQL table. If the article's URL is already there, it throws an error and continues on to the next article.
  3. The `searchAndAdd()` function then breaks the article text into sentences, loops through the list of search topics on each one, and returns an `insertPlaceMention` promise for each hit; 
  3. Each hit generates its own promise in the `insertPlaceMention(..)` function, which is is fulfilled when a result is written to the `place_mentions` table and returns its unique id. Once all `insertPlaceMention` promises are fulfilled, the `searchAndAdd` function returns the unique article id to the main promise chain.
6. The final `Promise.all()` function resolves when all of the article ids are returned from the `searchAndAdd()` function, and the app is finished.


Before we can test our local installation, we need a basic list of search topics to put in our `places` table. 

Our repository includes a file called `sampleData.sql` that populates our database with a very basic sample dataset for our queries. 

It adds one row in the `media_markets` table – the New York metropolitan area – and two rows each in the `publishers` and `feeds` tables, for the New York Post and the New York Daily News.

And, for the sake of simplicity, it only adds two rows in the `places` table: Brooklyn and Staten Island. Both these rows refer back to the "New York metro area" row in the `media_markets` table. 

To run these queries and update your database with the test data, run this command:

```
$ psql postgres < sampleData.sql
```

To see if it worked, send your database a simple SQL query:

```
$ psql postgres -c 'SELECT * FROM places'

 id |  place_name   | place_aliases | geocode | not_followed_by | not_preceded_by | market_id 
----+---------------+---------------+---------+-----------------+-----------------+-----------
  1 | Brooklyn      |               |         |                 |                 |         1
  2 | Staten Island |               |         |                 |                 |         1
(2 rows)
```
And now, the moment of truth...

Run the `bin/app.js` file with node:
```
$ node bin/app
```

You'll hopefully see some console logging messages stream by as various Javascript promises are fulfilled – from fetching the feed content, to adding search results to the `place_mentions` table. You'll probably also see some SQL error messages – something to be handled better in future versions of this software. 

Let's see what we got. Query your `place_mentions` table to see the results:

```
$ psql test -c 'SELECT * FROM place_mentions'
```

If all goes well, you should see here a list of article excerpts from today's New York City tabloids that mention "Brooklyn" and "Staten Island."

### Customizing your list of search topics

In practice, you're probably interested in more than two topics. If you're looking at New York City, you might want to analyze news mentions of all five boroughs, plus dozens of neighborhoods and maybe even some suburbs. 

To upload longer lists of topics to your database, I recommend using [pgAdmin](https://www.pgadmin.org/), a user-friendly PostgreSQL administration platform. It will allow you to import your topic lists as a csv file into the `places` table (important note: because the `market_id` column in the `places` table references a unique key in the `media_markets` table, you'll need to set up the `media_markets` table first).

## HOSTED INSTALLATION

This software has been running for several months in a hosted installation on Heroku, making use of the Heroku Scheduler to run once a day to catch new articles on each newspaper's RSS feed, and making use of embedded Javascript templates to display results as [JSON feeds](https://newsequityproject.herokuapp.com/nyc_json) and as [interactive maps](https://newsequityproject.herokuapp.com/). 

More detailed documentation on this option is coming soon!


