var express = require('express');
var phantom = require('phantom');
var path = require('path');
var jade = require('jade');
var childProcess = require('child_process');
var s3 = require('s3');
var fs = require('fs');
var guid = require('guid');
var random = require('randomstring');
var router = express.Router();
var _ = require('underscore');
var Entry = require('./entry.js');
var crypto = require('crypto');
var pdfPath = path.join(__dirname, '../pdf/');
var thumbnailPath = path.join(__dirname, '../pdf/thumbnails');

var AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
var S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;


/* BEGIN S3 */
var s3Client = s3.createClient({
    key: AWS_ACCESS_KEY_ID,
    secret: AWS_SECRET_ACCESS_KEY,
    bucket: S3_BUCKET_NAME
});
/* END S3 */

/* BEGIN JADE */
var compileJade,
    compileCoverJade;
/* END JADE */



var title = 'Preliminary Materials For a Theory of the ',
    baseFileName,
    pdfFileName,
    thumbnailFileName,
    fullPath,
    entry,
    pronounLookupTable = {
        he : {
            subjective : 'him',
            possesive : 'his'
        },
        she : {
            subjective : 'her',
            possesive : 'her'
        },
        it : {
            subjective : 'it',
            possesive : 'its'  
        }
    };

/* BEGIN CRUD */
router.post('/', function(req, res) {
    //console.log('API is hit with: ', req.body, ' type is: ', typeof req.body);

    // Generate the file name based on user input and add a random string to it.
    baseFileName = req.body.lastName + '-' + req.body.firstName + '-preliminatyMaterialsForTheTheoryOf-' + req.body.objectOfCritique + '-' + random.generate(5);
    pdfFileName = baseFileName + '.pdf';
    thumbnailFileName = baseFileName + '.png';
    
    title += req.body.adjective + '-' + req.body.objectOfCritique;
    // Generate the full file path
    //fullPath = path.join(saveToPath, fileName);

    //console.log('title: ', title, ' baseFileName: ', baseFileName, ' pdfFileName: ', pdfFileName, ' thumbnailFileName ', thumbnailFileName);
    
    
    // console.log(_.extend(req.body, {
    //         'title' : title,
    //         'pdfFileName' : pdfFileName,
    //         'thumbnailFileName' : thumbnailFileName,
    //         'thumbnailPath' : thumbnailPath,
    //         'pdfPath' : pdfPath   

    //     })
    // );
    // prepare the database entry by extending the request body object by two properties defined in the schema. 
    entry = new Entry(_.extend(req.body, {
            
            'title' : title,
            'pdfFileName' : pdfFileName,
            'thumbnailFileName' : thumbnailFileName,
            'thumbnailPath' : thumbnailPath,
            'pdfPath' : pdfPath   

        })
    );
    // save the entry
    entry.save(function(err, out) {
        
        if(err) {
            return console.log('Error writing entry to DB');
        }
        console.log('Entry for :', req.body.firstName , ' has been added');
        
        /* BEGIN PHANTOM */
        
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                compileJade = jade.renderFile(path.join(__dirname, '../views/manifesto.jade'), {
                    name : req.body.lastName,
                    objectOfCritique : req.body.objectOfCritique,
                    antagonist : req.body.antagonist,
                    adjective : req.body.adjective,
                    AP : req.body.antagonistPronoun,
                    APS : pronounLookupTable[req.body.antagonistPronoun].subjective,
                    APP : pronounLookupTable[req.body.antagonistPronoun].possesive,
                    PP : req.body.protagonistPronoun,
                    PPS : pronounLookupTable[req.body.protagonistPronoun].subjective,
                    PPP : pronounLookupTable[req.body.protagonistPronoun].possesive

                });
                page.setContent(compileJade);
                page.set('paperSize', {
                    width: '6.2in', 
                    height: '9.8in', 
                });
                console.log('saving to this path: ', path.join(pdfPath, pdfFileName));
                page.render(path.join(pdfPath, pdfFileName), function(err, out) {

                    var uploader = s3Client.upload(path.join(pdfPath, pdfFileName), '/' + pdfFileName);
                    uploader.on('error', function(err) {
                        return response.json(500, { 'error': 'Problem uploading to S3.' });
                    });
                    uploader.on('end', function() {
                    fs.unlink(path.join(pdfPath, pdfFileName), function(err){
                      var s3Url = 'https://' + process.env.AWS_BUCKET_NAME + '.s3.amazonaws.com/' + filename;
                      //return response.json(200, { 'url': s3Url });
                    });
                        res.send({redirect: '/archive'});    
                    
                    ph.exit();
                    });

                    console.log('done saving pdf file');
                    
                });

               
            });
    
           

        });
        
    /* END PHANTOM */
        res.send({redirect: '/archive'});   
    }); 
    
});


/* END CRUD */

module.exports = router;