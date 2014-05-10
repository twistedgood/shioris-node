var express = require('express');
var router = express.Router();

var Bookmark = require('../models/Bookmark').Bookmark;
var Q = require('q');
var request = require('request');
var cheerio = require('cheerio');
var jschardet = require('jschardet');
var Iconv = require('iconv').Iconv;

var renderList = function(req, res, param) {
  Bookmark.find(param).sort('created_at').exec(function(err, bookmarks) {
    res.render('bookmarks', {
      bookmarks: bookmarks
    });
  });
}

router.get('/', function(req, res) {
  var query = Bookmark.find({ user: req.session.user.id });
  if (req.param('q')) {
    var q = req.param('q').split(' ');
    for (var i in q) {
      console.log('#q:' + q[i]);
      query.where({ content: new RegExp(q[i], 'i') });
    }
  }
  query.sort('created_at');
  query.exec(function(err, bookmarks) {
    res.render('bookmarks', {
      bookmarks: bookmarks
    });
  });
});

router.get('/:user', function(req, res) {
  var param = {};
  if (req.param('user')) {
    param = { user: req.param('user') };
  }
  renderList(req, res, param);
});

router.post('/', function(req, res) {
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
