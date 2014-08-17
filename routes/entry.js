var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userInputSchema = Schema({
	title : String,
	createdAt: { type: Date, default: Date.now },
	pdfFileName : String,
    thumbnailFileName : String,
    thumbnailPath : String,
    pdfPath : String,
    firstName : String,
    lastName : String,
    objectOfCritique : String,
    adjective : String,
    protagonistPronoun : String,
    antagonistPronoun : String,
    antagonist: String
});

module.exports = mongoose.model('userInput', userInputSchema);

