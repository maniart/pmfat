var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* POST api. */
router.post('/', function(req, res) {
  console.log('API is hit with: ', req.body);
  //res.render('index', { title: 'Express' });
});

module.exports = router;

/*
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to mongodb');
});
var userInputSchema = {
    firstName : String,
    lastName : String,
    objectOfCritique : String,
    adjective : String,
    protagonistPronoun : String,
    antagonistPronoun : String
};
var userInput = mongoose.model('userInput', userInputSchema);
var test = new userInput({
    firstName : 'Mani',
    lastName : 'Nilchiani',
    objectOfCritique : 'bananas',
    adjective : 'happy',
    protagonistPronoun : 'her',
    antagonistPronoun : 'him'
});
test.save(function(err, out) {
    if(err) {
        return console.log('Error writing to DB');
    }
    console.log('yay. saved to DB.');

});

*/