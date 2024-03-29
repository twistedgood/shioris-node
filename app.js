var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');
var config = require('config');
var validator = require('express-validator');

var routes = require('routes/index');
var users = require('routes/users');
var bookmarks = require('routes/bookmarks');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(validator());
app.use(session({ secret: 'shioris' }));
app.enable('trust proxy');

// 
app.use(function(req, res, next) {
  if (req.url !== req.originalUrl) {
    req.url =  req.url.replace(/^\/+/, '');
  }
  next();
});

// check login
app.use(function(req, res, next) {
  if (req.session.user) {
    console.log('session user:' + req.session.user.id);
    res.locals.isLogin = true;
    res.locals.loginUser = req.session.user.id;
    if (req.session.user.admin) {
      res.locals.isAdmin = true;
    }
  }
  next();
});

app.use('/', routes);

// auth
app.use(function(req, res, next) {
  if (!res.locals.isLogin) {
    res.redirect('login');
  }
  next();
});

app.use('/users', users);
app.use('/bookmarks', bookmarks);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

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

// helper
app.locals.title = "Shioris";
app.locals.config = config;
app.locals.dateformat = require('dateformat');
  console.log('#app.locals.title@app:' + app.locals.title);

// connect mongodb
console.log('env:[' + app.get('env') + ']');
var db = config.mongodb;
console.log('db:[' + db + ']');
mongoose.connect(config.mongodb);

module.exports = app;
