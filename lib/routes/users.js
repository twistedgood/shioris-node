var express = require('express');
var router = express.Router();

var Q = require('q');
var User = require('models/User').User;

router.get('/', function(req, res) {
  renderList(req, res);
});

router.post('/', function(req, res) {
  Q.defer();
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
  Q(User.findOne({
    id: req.param('id')
  }).exec())
  .then(function(user) {
    if (user) {
      throw new Error('Duplicated id. Please enter other.');
    }
  })
  .then(function() {
    return Q(User.create({
      id: req.param('id'),
      password: req.param('password')
    }))
  })
  .then(function() {
    res.redirect('users');
  })
  .catch(function(error) {
    res.locals.errors = (Array.isArray(error)) ? error : [error];
    renderList(req, res);
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
