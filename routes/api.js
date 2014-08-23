/* Imported modules */
var express,
    path,
    phantomjs,
    child_process,
    jade,
    fs,
    random,
    _;

express = require('express');
path = require('path');
phantomjs = require('phantomjs');
child_process = require('child_process');
jade = require('jade');
fs = require('fs');
random = require('randomstring');
_ = require('underscore');

/* Local vars */

var binPath,
    router,
    Entry,
    pdfPath,
    thumbnailPath,
    compileJade,
    compileCoverJade,
    title,
    baseFileName,
    pdfFileName,
    thumbnailFileName,
    fullPath,
    entry,
    pronounLookupTable,
    childArgs;


binPath = phantomjs.path;
router = express.Router();
Entry = require('./entry.js');
pdfPath = path.join(__dirname, '../../public_html/pdf/');
thumbnailPath = path.join(__dirname, '../../public_html/pdf/thumbnails/');
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
childArgs = [
    path.join(__dirname, '../phantom-script.js')
];

/* BEGIN CRUD */
router.post('/', function(req, res) {
    
    // Generate the file name based on user input and add a random string to it.
    baseFileName = req.body.lastName 
                + '-' + req.body.firstName 
                + '-preliminatyMaterialsForTheTheoryOf-' 
                + req.body.adjective + '-' 
                + req.body.objectOfCritique 
                + '_' 
                + random.generate(5);
                pdfFileName = baseFileName + '.pdf';

    thumbnailFileName = baseFileName + '.png';
    
    title = 'Preliminary Materials For a Theory of the ' 
            + req.body.adjective 
            + '-' 
            + req.body.objectOfCritique;
    
    entry = new Entry(_.extend(req.body, {
            
            'title' : title,
            'pdfFileName' : pdfFileName,
            'thumbnailFileName' : thumbnailFileName,
            'thumbnailPath' : thumbnailPath + thumbnailFileName,
            'pdfPath' : pdfPath + pdfFileName   

        })
    );

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
        /*
        child_process.execFile(binPath, childArgs, function(err, stdout, stderr) {
          // handle results
            if(err) {
                console.log(err);

            } else {
                console.log('stdout is: ', stdout);
                console.log('stderr is: ', stdout);    
            }
            
        });
    */
        fs.writeFile('./test.html', compileJade, function(err) {
            if(err) {
                console.log('>> api.js : error while saving new file with fs: ', err);
            } else {
                console.log('>> api.js : file saved');
                child_process.execFile(binPath, childArgs, function(err, stdout, stderr) {
                    if(err) {
                        console.log('>> api.js : error is: ', err);

                    } else {
                        console.log('>> api.js : stdout is: ', stdout);
                        console.log('>> api.js : stderr is: ', stdout);    
                        res.send({redirect: '/archive'});
                        res.end();
                    }
                });
            }
        });

        // BEGIN PHANTOM 

        /*

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
        */
    // END PHANTOM
    

    }); 

 
    
});


/* END CRUD */

module.exports = router;