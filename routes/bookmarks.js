var express = require('express');
var router = express.Router();

var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var Bookmark = require('../models/Bookmark').Bookmark;

var renderList = function(req, res, param) {
  Bookmark.find(param).sort('created_at').exec(function(err, bookmarks) {
    res.render('bookmarks', {
      bookmarks: bookmarks
    });
  });
}

router.get('/', function(req, res) {
  var query = Bookmark.find();
  if (req.param('u')) {
    var user = req.param('u');
    query.where({ user: user });
  } else {
    query.where({ user: req.session.user.id });
  }
  query.sort('created_at');
  if (req.param('q')) {
    var q = req.param('q').split(' ');
    for (var i in q) {
      query.where({ content: new RegExp(q[i], 'i') });
    }
    res.locals.q = req.param('q');
  }
  query.exec(function(err, bookmarks) {
    res.render('bookmarks', {
      bookmarks: bookmarks
    });
  });
});

router.post('/', function(req, res) {
  req.assert('url', 'URL is required.').notEmpty();
  req.assert('url', 'URL is invalid.').isURL();
  var errors = req.validationErrors();
  if (errors) {
    res.locals.errors = errors;
    renderList(req, res, { user: req.session.user.id });
  }
  Q.nmcall(Bookmark, 'findOne', {
    url: req.param('url'),
    user: req.session.user.id
  })
  .then(function(bookmark) {
    var deferred = Q.defer();
    if (bookmark) {
      deferred.reject("Already Registered");
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  })
  .then(function() {
    return Q.nmcall(request, 'get', {
      url: req.param('url'),
      encoding: 'binary'
    });
  })
  .then(function(responseArray) {
    var response = responseArray[0];
    var body = responseArray[1];
    body = convert(new Buffer(body, 'binary'));
    var $ = cheerio.load(body);
    var title = $("title").text();
    return Q.nmcall(Bookmark, 'create', {
      url: response.request.uri.href,
      title: title,
      content: $.root().text().replace(/<|>/g, ''),
      user: req.session.user.id
    })
  })
  .then(function() {
    res.redirect('bookmarks');
  })
  .catch(function(error) {
    res.locals.errors = [error];
    renderList(req, res, { user: req.session.user.id });
  })
  .done();
});

var convert = function(text) {
  var detected = jschardet.detect(text);
  console.log('#detected:' + detected.encoding);
  var iconv = new Iconv(detected.encoding,'UTF-8//TRANSLIT//IGNORE');
  text = iconv.convert(text).toString();
  return text;
}

module.exports = router;
