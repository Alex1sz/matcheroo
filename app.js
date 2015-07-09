var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var User = require('./models/user');
var passport = require('./passport');
var dbUrl = process.env.MONGOLAB_URI || 'mongodb://@localhost:27017/matcheroo_dev';
var db = mongoose.connect(dbUrl, {safe: true});
var config = require('./config')();

// dotenv for handling of secret env variables
var dotenv = require('dotenv').load();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redisUrl = require("url").parse(process.env.REDISTOGO_URL);
var redisAuth = redisUrl.auth.split(':');

if (process.env.REDISTOGO_URL) {
  var redis = require("redis").createClient(redisUrl.port, redisUrl.hostname);
  redis.auth(redisUrl.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

/*
 * redis session store

var RedisStore = require('connect-redis')(session);
var redisUrl = require("url").parse(process.env.REDISTOGO_URL);
var redisAuth = redisUrl.auth.split(':')

if (process.env.REDISTOGO_URL) {
  var redis = require("redis").createClient(redisUrl.port, redisUrl.hostname);
  redis.auth(redisUrl.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}
 */

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser('my secreto'));
/* app.use(session({
  store: new RedisStore({
    host: "127.0.0.1",
    port: "6379"
  }),
  secret: process.env.SESSION_SECRET
}));
*/
app.use(session({
  secret: "whatitdo",
  store: new MongoStore({
    url: config.sessionDb
  })
}));
app.use(require('body-parser')());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.exposeUser());

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.listen(process.env.PORT || 3000, function() {
  console.log('Express listening on port 3000');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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


module.exports = app;
