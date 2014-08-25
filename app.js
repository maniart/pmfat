var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MONGO_LOCAL = 'mongodb://localhost/pmfat';
var routes = require('./routes/index');
var archive = require('./routes/archive');
var api = require('./routes/api');
var about = require('./routes/about');
//var npid = require('npid');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
console.log('dir is: ', __dirname);
app.use(favicon({ maxAge: 0 }));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(  ));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/archive', archive);
app.use('/api', api);
app.use('/about', about);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('port', process.env.PORT || 3000);

/// error handlers


if(app.get('env') === 'production') {
    try {
        var pid = npid.create('/var/run/pmfat.pid');
        pid.removeOnExit();
    } catch (err) {
        console.log('>> app.js - npmid error : ',err);
        process.exit(1);
    }
}


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/* BEGIN MONGODB */
mongoose.connect('mongodb://localhost/pmfat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to mongodb', ' port is: ', app.get('port'));
});


/* REMOVE pmfat.pid FILE ON EXIT */
process.stdin.resume();//so the program will not close instantly

var exitHandler = function exitHandler(options, err) {
    if(app.get('env') === 'production') {
        if (options.cleanup) {
            fs.unlink('/var/run/pmfat.pid', function() {
                console.log('>> app.js : Before closing : removed pmfat.pid');    
            });
            
        }
    }
    console.log('>> app.js : Doing some stuff before closing the app.');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

module.exports = app;
