var express = require('express');
var router = express.Router();

var Q = require('q');
var User = require('../models/User').User;

router.get('/', function(req, res) {
  renderList(req, res);
});

router.post('/', function(req, res) {
  req.sanitize('id').trim();
  req.assert('id', 'ID is required.').notEmpty();
  req.assert('id', 'ID is invalid.').matches(/^[0-9a-zA-Z_]+$/);
  req.sanitize('password').trim();
  req.assert('password', 'Password is required.').notEmpty();
  req.assert('password', 'Password is invalid.').isLength(6).matches(/^[\d\w]+$/);
  var errors = req.validationErrors();
  if (errors) {
    res.locals.errors = errors;
    renderList(req, res, { user: req.session.user.id });
    return;
  }
  Q.nmcall(User, 'findOne', {id: req.param('id') })
  .then(function(user) {
    var deferred = Q.defer();
    if (user) {
      deferred.reject('Duplicated id. Please enter other.');
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  })
  .then(function() {
    Q.nmcall(User, 'create', {
      id: req.param('id'),
      password: req.param('password')
    });
  })
  .then(function() {
    res.redirect('users');
  })
  .catch(function(error) {
    res.locals.errors = [error];
    renderList(req, res);
    return;
  })
  .done();
});

var renderList = function(req, res) {
  User.find({}, function(err, users) {
    res.render('users', {
      users: users
    });
  });
};

module.exports = router;
