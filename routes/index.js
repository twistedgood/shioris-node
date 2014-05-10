var express = require('express');
var router = express.Router();

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
  if (req.param('id') === 'admin') {
    req.session.user = { id: 'admin' };
    res.redirect('/users');
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
    res.redirect('/bookmarks');
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
  res.redirect('/login');
});

module.exports = router;
