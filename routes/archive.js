var express = require('express');
var Entry = require('./entry');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
	var entries = Entry.find({}, function(error, entries) {
		if(error) {
			throw new Error('Error in finding entries: ', error)
		}
		console.log('Entries found! : ', entries, ' type is: ', typeof entries);
		res.render('archive', { entries : entries, test : 'BLAH' });
	});
  	  
});

module.exports = router;
