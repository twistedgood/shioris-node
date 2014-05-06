var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');

var User = require('../models/User').User;

describe('user test', function() {
  before(function(done) {
    User.remove({}, function() {
      done();
    }); 
  });

  describe('* /logout', function() {
    it('should add a user', function(done) {
      request(app)
      .get('/logout')
      .expect(302)
      .end(done);
    });
  });

});

