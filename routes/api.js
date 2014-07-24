var express = require('express');
var mongoose = require('mongoose');
var phantom = require('phantom');
var path = require('path');
var jade = require('jade');
var router = express.Router();

var saveToPath = path.join(__dirname, '../pdf');

/* BEGIN JADE */
var compileJade;
/* END JADE */


/* BEGIN MONGODB */
mongoose.connect('mongodb://localhost/pmfat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to mongodb');
});
var userInputSchema = mongoose.Schema({
    firstName : String,
    lastName : String,
    objectOfCritique : String,
    adjective : String,
    protagonistPronoun : String,
    antagonistPronoun : String
});
var userInput = mongoose.model('userInput', userInputSchema);
/* END MONGODB */

/* BEGIN CRUD */
router.post('/', function(req, res) {
  console.log('API is hit with: ', req.body, ' type is: ', typeof req.body);
  var entry = new userInput(req.body);
  entry.save(function(err, out) {
    if(err) {
        return console.log('Error writing entry to DB');
    }
    console.log('Entry for :', req.body.firstName , ' has been added');
    /* BEGIN PHANTOM */
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            compileJade = jade.renderFile(path.join(__dirname, '../views/manifesto.jade'), { name : req.body.lastName })
            page.setContent(compileJade);
            page.set('paperSize', {
                width: '6.2in', 
                height: '9.8in', 
                //border: '20px' 
            });
            page.render(path.join(saveToPath, '/file.pdf'), function() {
                // file is now written to disk
                console.log('done saving pdf file');
                ph.exit();
            });
            /*
            page.open("http://www.google.com", function (status) {
            //     console.log("opened google? ", status);
                
                
            });
        */
        });
    });
    /* END PHANTOM */
});

  res.send('OK');
  //res.render('manifesto', {});
});
/* END CRUD */

module.exports = router;