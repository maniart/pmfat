var express = require('express');
var phantom = require('phantom');
var path = require('path');
var jade = require('jade');
var fs = require('fs');
var random = require('randomstring');
var router = express.Router();
var _ = require('underscore');
var Entry = require('./entry.js');
var pdfPath = path.join(__dirname, '../../public_html/pdf/');
var thumbnailPath = path.join(__dirname, '../../public_html/pdf/thumbnails/');

/* BEGIN JADE */
var compileJade,
    compileCoverJade;
/* END JADE */



var title,
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
    // Generate the file name based on user input and add a random string to it.
    baseFileName = req.body.lastName + '-' + req.body.firstName + '-preliminatyMaterialsForTheTheoryOf-' + req.body.adjective + '-' + req.body.objectOfCritique + '_' + random.generate(5);
    pdfFileName = baseFileName + '.pdf';
    thumbnailFileName = baseFileName + '.png';
    
    title = 'Preliminary Materials For a Theory of the ' + req.body.adjective + '-' + req.body.objectOfCritique;
    
    console.log('adjective: ', req.body.adjective, '\n', 'objectOfCritique: ', req.body.objectOfCritique, '\n', 'title:', title );


    // prepare the database entry by extending the request body object by two properties defined in the schema. 
    entry = new Entry(_.extend(req.body, {
            
            'title' : title,
            'pdfFileName' : pdfFileName,
            'thumbnailFileName' : thumbnailFileName,
            'thumbnailPath' : thumbnailPath + thumbnailFileName,
            'pdfPath' : pdfPath + pdfFileName   

        })
    );
    console.log('entry is: ', entry);

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

    // save the entry
    entry.save(function(err, out) {
                
        if(err) {
            return console.log('Error writing entry to DB');
        }
        //console.log('Entry for :', req.body.firstName , ' has been added');
        
        // BEGIN PHANTOM 
               
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                
                page.set('paperSize', {
                    width: '6.2in', 
                    height: '9.8in', 
                });
                page.setContent(compileJade);
                
                console.log('saving to this path: ', path.join(pdfPath, pdfFileName));
                
                page.render(path.join(pdfPath, pdfFileName), function(err, out) {
                    if(err) {
                        throw err;
                        return;
                    }
                    console.log('done saving pdf file');
                    
                });

               
            });

            ph.createPage(function (page) {
                compileCoverJade = jade.renderFile(path.join(__dirname, '../views/cover.jade'), {
                    name : req.body.lastName,
                    objectOfCritique : req.body.objectOfCritique,
                    antagonist : req.body.antagonist,
                    adjective : req.body.adjective,
                });

                page.set('paperSize', {
                    width: '6.2in', 
                    height: '9.8in', 
                });
                page.setContent(compileCoverJade);
                
                console.log('saving thumbnails to this path: ', path.join(thumbnailPath, thumbnailFileName));
                page.render(path.join(thumbnailPath, thumbnailFileName), function(err, out) {
                    if(err) {
                        throw err;
                        return;
                    }
                    // file is now written to disk
                    console.log('done saving png file');
                    ph.exit();
                    res.send({redirect: '/archive'});
                    res.end();
                    
                });
                
            });

        });
        
    // END PHANTOM
    

    }); 

 
    
});


/* END CRUD */

module.exports = router;