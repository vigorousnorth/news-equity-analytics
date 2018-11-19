# news-equity-analytics
Tools to analyze news feeds for equity in coverage.

This is a Node.js package to parse a news organization's RSS feeds and analyze its text for arrays of key topics – whether they're towns, or politicians, or sports teams – to generate data on how equitably journalism institutions allocate their attention.

Results are saved in a PostgreSQL database described by the `database.sql` file. This code can be run locally, or scheduled to run daily on a hosted Node.js server.  


## LOCAL INSTALLATION ##

This app can be run locally. To do so, you'll need [have Node.js and npm installed locally](https://nodejs.org/en/download/), plus [a local PostgreSQL database](https://medium.freecodecamp.org/how-to-get-started-with-postgresql-9d3bc1dd1b11). 

Clone the repository to your hard drive by running these commands in your command shell or terminal:

```
$ git clone https://github.com//vigorousnorth/news-equity-analytics.git
$ cd news-equity-analytics
```

###Setting up your database###

This software uses PostgreSQL database to save records of when and where specific topics are mentioned in news feeds of interest. The database is described by the `database.sql` file, which can be imported from the command line to set up all the nececssary tables. Here's a quick, plain-english guide to the most important tables we're setting up:

######feeds######
The `feeds` table includes information about the RSS feeds we're scraping, including URLs, a publisher ID that links to the `publishers` table, and XML information.

######places######
The `places` table describes the topics we're searching for in each news story. Generally these are names of cities, towns or neighborhoods, but this table could also be used to include lists of people, sports teams or other topics of interest. 

Each entry includes a column for potential aliases and disambiguation columns (`not_followed_by` and `not_preceded_by`) to filter out unwanted matches (for instance, to find mentions of "Brooklyn" but not "Brooklyn Nets" or "Brooklyn Bridge, the comma-separated string "Nets,Bridge" would be included in the `not_followed_by` column for Brooklyn).

######articles#######
A table of individual news articles, including columns for the `headline`, `date`, `byline` and `url`. The `feed_id` column references the corresponding id from the `feeds` table.

The `url` column performs as a unique key, so that duplicate values of one article at the same url are not allowed.

######place_mentions#######
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

If that's what you're seeing, that's good, we're ready to run the software. 

We're using the dotenv package to manage database connections and credentials. For a local installation, create a new text file inside the `news-equity-analytics` directory like this one:

```
DB_HOST=127.0.0.1
DB=postgres
DATABASE_URL=postgresql://localhost/postgres?user=[your database user name]&password=[your database password]
NODE_ENV=local
```

and save the file as `.env` (you'll use different environment variables if and when you install this software on a hosted server).

