var express = require('express');
var phantom = require('phantom');
var path = require('path');
var jade = require('jade');
var random = require('randomstring');
var router = express.Router();
var _ = require('underscore');
var Entry = require('./entry.js');

var pdfPath = path.join(__dirname, '../pdf/');
var thumbnailPath = path.join(__dirname, '../pdf/thumbnails');

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
    //console.log('entry: ', bar);
    entry = new Entry(_.extend(req.body, {
            'title' : title,
            'pdfFileName' : pdfFileName,
            'thumbnailFileName' : thumbnailFileName,
            'thumbnailPath' : thumbnailPath,
            'pdfPath' : pdfPath   

        })
    );
    console.log('entry created ', entry);
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
                /*TODO: catch 500 */
                console.log('saving to this path: ', path.join(pdfPath, pdfFileName));
                page.render(path.join(pdfPath, pdfFileName), function(err, out) {

                    // file is now written to disk
                    console.log('done saving pdf file');
                    //ph.exit();
                    
                });

               
            });

            ph.createPage(function (page) {
                compileCoverJade = jade.renderFile(path.join(__dirname, '../views/cover.jade'), {
                    name : req.body.lastName,
                    objectOfCritique : req.body.objectOfCritique,
                    antagonist : req.body.antagonist,
                    adjective : req.body.adjective,
                });

                page.setContent(compileCoverJade);
                page.set('paperSize', {
                    width: '6.2in', 
                    height: '9.8in', 
                });
                /*TODO: catch 500 */
                console.log('saving thumbnails to this path: ', path.join(thumbnailPath, thumbnailFileName));
                page.render(path.join(thumbnailPath, thumbnailFileName), function(err, out) {

                    // file is now written to disk
                    console.log('done saving png file');
                    ph.exit();
                    
                });
                
            });

        });
    /* END PHANTOM */
    }); 
    res.send({redirect: '/archive'});
});


/* END CRUD */

module.exports = router;