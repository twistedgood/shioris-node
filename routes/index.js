var express = require('express');
var router = express.Router();

var config = require('config');

var Q = require('q');
var User = require('../models/User').User;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Shioris' });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req, res) {
  var admin = config.admin;
  if (req.param('id') === admin.id && req.param('password') === admin.password) {
    req.session.user = { id: admin.id, admin: true };
    res.redirect('users');
    return;
  }
  Q(User.findOne({
    id: req.param('id'),
    password: req.param('password')
  }).exec())
  .then(function(user) {
    if (!user) {
      throw new Error('Authentication failed.');
    }
    req.session.user = user;
    res.redirect('bookmarks');
  })
  .catch(function(error) {
    res.locals.errors = (Array.isArray(error)) ? error : [error];
    res.render('login');
  })
  .done();
});

router.all('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('login');
});

module.exports = router;
