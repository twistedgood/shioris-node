var express = require('express');
var router = express.Router();

var User = require('../models/User').User;

router.get('/', function(req, res) {
  renderList(req, res);
});

router.post('/', function(req, res) {
  User.findOne({ id: req.param('id') }, function(err, user) {
    if (err) {
      res.send('error: ' + err);
      return;
    }
    if (user) {
      res.locals.errors = ['Duplicated id. Please enter other.'];
      renderList(req, res);
      return;
    }
    User.create({
       id: req.param('id')
     , name: req.param('name')
    }, function(err) {
      res.redirect('back');
    });
  });
});

var renderList = function(req, res) {
  User.find({}, function(err, users) {
    res.render('users', {
      users: users
    });
  });
};

module.exports = router;
