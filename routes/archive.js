var express = require('express');
var Entry = require('./entry');
var router = express.Router();
var prettyDate = require('pretty-date');
var _ = require('underscore');
var prettifyDates;

addPrettyDates = function(entries) {
	// if(!entries instanceof Array) {
	// 	throw new Error('input needs to be an array of entries');
	// }	
	_.each(entries, function(entry, index, list) {
		if(!entry.createdAd instanceof Date) {
			throw new Error('input needs to be of type "Date"');	
		}
		entry.createdAtPretty = prettyDate.format(entry.createdAt);
		//console.log(entry.createdAtPretty);
	});
	return entries;
};
/* GET home page. */

router.get('/', function(req, res) {
	var entries = Entry.find({}, function(error, entries) {
		//console.log(entries instanceof Array);
		if(error) {
			throw error;
		}
		//console.log('Entries found! : ', entries, ' type is: ', typeof entries);
		//console.log('entries are : ', entries);
		res.render('archive', { 
			bodyClass : 'archive',
			entries : addPrettyDates(entries)
		});
	});
  	  
});

module.exports = router;
