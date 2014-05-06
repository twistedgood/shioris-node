var express = require('express');
var router = express.Router();

var Bookmark = require('../models/Bookmark').Bookmark;

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
  Bookmark.create({
    url: req.param('url'),
    title: '',
    content: '',
    user: req.session.user.id
  }, function(err) {
    res.redirect('/bookmarks');
  });
});

module.exports = router;
