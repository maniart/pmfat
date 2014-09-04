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
    compiledManifesto,
    compiledCover,
    title,
    baseFileName,
    pdfFileName,
    thumbnailFileName,
    htmlFileName,
    fullPath,
    entry,
    pronounLookupTable,
    phantomArgs,
    replaceSpacesWithDash;

phantomArgs = [];
binPath = phantomjs.path;
router = express.Router();
Entry = require('./entry.js');


pdfPath = path.join(__dirname, '../../public_html/pdf/');
thumbnailPath = path.join(__dirname, '../../public_html/pdf/thumbnails/');
htmlPath = path.join(__dirname, '../../public_html/pdf/tmp/');

replaceSpacesWithDash = function(string) {

    if(typeof string !== 'string') {
        throw new TypeError('Input should be a string');
        return;
    }

    return string.replace(/\s+/g, '-');

};

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
    baseFileName = req.body.lastName 
                + '-' + req.body.firstName 
                + '-preliminatyMaterialsForTheTheoryOf-' 
                + req.body.adjective + '-' 
                + req.body.objectOfCritique 
                + '_' 
                + random.generate(5);

    baseFileName = replaceSpacesWithDash(baseFileName);

    baseFileName = encodeURIComponent(baseFileName);
    
    pdfFileName = baseFileName + '.pdf'; // final pdf output file name
    thumbnailFileName = baseFileName + '.png'; // final cover output file name
    htmlFileName = baseFileName + '.html'; // temporary rendered html file name

    phantomArgs = [
        path.join(__dirname, '../phantom-scripts/render.js'),
        htmlPath + htmlFileName,
        pdfPath + pdfFileName,
        thumbnailPath + thumbnailFileName
    ];


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

    compiledManifesto = jade.renderFile(path.join(__dirname, '../views/manifesto.jade'), {
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
        
        fs.writeFile(htmlPath + htmlFileName, compiledManifesto, function(err) {
            if(err) {
                console.log('>> api.js : error while saving new file with fs: ', err);
            } else {
                console.log('>> api.js : file saved');
                
                phantomProcess = child_process.execFile(binPath, phantomArgs, function(err, stdout, stderr) {
                    if(err) {
                        console.log('>> api.js : error is: ', err);

                    } else {
                        
                        console.log('>> api.js : stdout is: ', stdout);
                        console.log('>> api.js : stderr is: ', stdout);    
                        
                        fs.unlink(htmlPath + htmlFileName, function (err) {
                            if (err) throw err;
                            console.log('>> api.js : tmp html file removed.');
                        });
                        
                        res.send({
                            redirect: '/archive'
                        });
                        
                        res.end();
                    }
                });

                phantomProcess.stdout.on('data', function(data) {
                    console.log(data.toString()); 
                });
                
            }
        });

    }); 

});


/* END CRUD */

module.exports = router;