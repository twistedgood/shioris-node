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

  describe('GET /users', function() {
    it('should retun an array', function(done) {
      request(app)
      .get('/users')
      .expect(200)
      .expect(/Add User/)
      .expect(/User Listing/)
      .end(done);
    });
  });

  describe('POST /users', function() {
    it('should add a user', function(done) {
      request(app)
      .post('/users')
      .send({ id: 'hoge', name: 'hoge' })
      .expect(302)
      .end(done);
    });
  });

});

