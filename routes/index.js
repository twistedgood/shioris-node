var express = require('express');
var router = express.Router();

var User = require('../models/User').User;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req, res) {
  User.findOne({ id: req.param('id') }, function(err, user) {
    if (err) {
      res.send('error: ' + err);
      return;
    }
    if (!user) {
      res.locals.errors = ['Invalid user.'];
      res.render('login');
      return;
    } 
    req.session.user = user;
    res.redirect('/users');
  });
});

router.all('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/login');
});

module.exports = router;
