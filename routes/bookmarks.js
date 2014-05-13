var express = require('express');
var router = express.Router();

var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var Bookmark = require('../models/Bookmark').Bookmark;

router.get('/', function(req, res) {
  debugger;
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
  query.exec(function(error, bookmarks) {
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
    renderList(errors, req, res);
    return;
  }
  Q(Bookmark.findOne({
    url: req.param('url'),
    user: req.session.user.id
  }).exec())
  .then(function(bookmark) {
    if (bookmark) {
      throw new Error('Already Registered.');
    }
  })
  .then(function() {
    return Q.nmcall(request, 'get', {
      url: req.param('url'),
      encoding: 'binary'
    });
  })
  .spread(function(response, body) {
    body = convert(new Buffer(body, 'binary'));
    var $ = cheerio.load(body);
    var title = $('title').text();
    return Q(Bookmark.create({
      url: response.request.uri.href,
      title: title,
      content: $.root().text().replace(/<|>/g, ''),
      user: req.session.user.id
    }));
  })
  .then(function() {
    res.redirect('bookmarks');
  })
  .catch(function(error) {
    renderList(error, req, res);
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

var renderList = function(error, req, res) {
  var errors = (Array.isArray(error)) ? error : [error];
  var query = Bookmark.find();
  query.where({ user: req.session.user.id });
  query.sort('created_at');
  query.exec(function(error, bookmarks) {
    if (error) {
      throw new Error(error);
    }
    res.render('bookmarks', {
      bookmarks: bookmarks,
      errors: errors
    });
  });
}

module.exports = router;
