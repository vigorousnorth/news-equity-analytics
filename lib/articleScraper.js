var request = require('request');
var cheerio = require('cheerio');

module.exports = (url, selector) => {
	
	return new Promise(function (resolve, reject) {

		request(url, function(error, response, html) {
			// console.log(response.statusCode);
		  if (error) { console.log(error); }

		  else if (!error && response.statusCode == 200) {
		  
		    var $ = cheerio.load(html);
		    var bodytext = "", graf =[];
		    
		    $(selector).each(function(i, elem) {
			  		graf[i] = $(this).text().trim();
				});

			  graf.join(" ");
		    
		    resolve(bodytext);

		  }

		});

	});

}

