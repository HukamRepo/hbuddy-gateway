'use strict'

var google = require('google')

google.resultsPerPage = 25
var nextCounter = 0

function searchGoogle(keywords){
	google(keywords, function (err, res){
		  if (err) console.error(err);
		  console.log("\n\n------------------------------- \n");
		  for (var i = 0; i < res.links.length; ++i) {
		    var link = res.links[i];
//		    console.log(link.title)
		    console.log(link.description + "\n")
		  }
		  /*
		  if (nextCounter < 4) {
		    nextCounter += 1
		    if (res.next) res.next()
		  }
		  */
		});
}

console.log('Searching in Google ...');
searchGoogle('what is the meaning of ilets ?');
