# news-equity-analytics
Tools to analyze news feeds for equity in coverage.

This is a node package to parse a news organization's RSS feeds and analyze its text for arrays of key topics – whether they're town names, or politician names, or sports teams – to generate data on how equitably journalism institutions allocate their attention.

The config.js file defines the target RSS feed and defines the array of topics to analyze. (to do: design a front-end interface where users can populate these variables without knowing Javascript)

The feedparser.js file initializes the RSS feed stream and runs searches on each item (for now it's only analyzing headlines).

The itemsearch.js module contains the text analytics functions. 

To try it out, download the repository, navigate to the downloaded directory in Terminal, and run "node feedparser.js." 

## Next steps

Expand text analytics functions to include article summary decks, bodies and caption information.

Add some functions to write the analytics results to a SQL table. 