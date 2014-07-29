var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userInputSchema = Schema({
    fileName : String,
    pdfPath : String,
    thumbPath : String,
    firstName : String,
    lastName : String,
    objectOfCritique : String,
    adjective : String,
    protagonistPronoun : String,
    antagonistPronoun : String,
    antagonist: String
});

module.exports = mongoose.model('userInput', userInputSchema);

