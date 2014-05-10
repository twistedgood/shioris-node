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
  }
  Q.nmcall(User, 'findOne', {
    id: req.param('id'),
    password: req.param('password')
  })
  .then(function(user) {
    var deferred = Q.defer();
    if (!user) {
      deferred.reject('Aunthenticatin failed.');
    } else {
      deferred.resolve(user);
    }
    return deferred.promise;
  })
  .then(function(user) {
    req.session.user = user;
    res.redirect('bookmarks');
  })
  .catch(function(error) {
    res.locals.errors = [error];
    res.render('login');
    return;
  })
  .done();
});

router.all('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('login');
});

module.exports = router;
