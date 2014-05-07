var express = require('express');
var router = express.Router();

var Bookmark = require('../models/Bookmark').Bookmark;
var Q = require('q');
var request = require('request');
var jsdom = require('jsdom');

var renderList = function(req, res, param) {
  Bookmark.find(param, function(err, bookmarks) {
    res.render('bookmarks', {
      bookmarks: bookmarks
    });
  });
}

router.get('/', function(req, res) {
  renderList(req, res, { user: req.session.user.id });
});

router.get('/:user', function(req, res) {
  var param = {};
  if (req.param('user')) {
    param = { user: req.param('user') };
  }
  renderList(req, res, param);
});

router.post('/', function(req, res) {
  Q.nmcall(Bookmark, 'findOne', { url: req.param('url') })
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
    return Q.nmcall(request, 'get', req.param('url'));
  })
  .then(function(response) {
    var deferred = Q.defer();
    jsdom.env({
      html: response[1],
      done: function(err, window) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(window);
        }
      }
    });
    return deferred.promise;
  })
  .then(function(window) {
    return Q.nmcall(Bookmark, 'create', {
      url: req.param('url'),
      title: window.document.title,
      content: '',
      user: req.session.user.id
    })
  })
  .then(function() {
    res.redirect('/bookmarks');
  })
  .catch(function(error) {
    res.locals.errors = [error];
    renderList(req, res, { user: req.session.user.id });
  })
  .done();
});

module.exports = router;
