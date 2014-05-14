var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');

var Q = require('q');
var User = require('../models/User').User;

describe('index test', function() {

  before(function(done) {
    Q(User.remove({}).exec())
    .then(function() {
      User.create({
        id: 'user@test',
        password: 'pswd@test'
      });
    })
    .done(function() {
      done();
    });
  });

  describe('GET /login', function() {
    it('should show login form', function(done) {
      request(app)
      .get('/login')
      .expect(200)
      .end(done);
    });
  });

  describe('POST /login', function() {
    it('should login when request is valid', function(done) {
      request(app)
      .post('/login')
      .send({ id: 'user@test', password: 'pswd@test' })
      .expect(302)
      .expect(/Redirecting to bookmarks/)
      .end(done);
    });

    it('should fail to login when request is invalid', function(done) {
      request(app)
      .post('/login')
      .send({ id: 'wrong_id', password: 'wrong_pswd' })
      .expect(200)
      .expect(/Error: Authentication failed./)
      .end(done);
    });

    it('should login as admin when request is valid', function(done) {
      request(app)
      .post('/login')
      .send({ id: 'admin', password: 'test' })
      .expect(302)
      .expect(/Redirecting to users/)
      .end(done);
    });
  });

  describe('* /logout', function() {
    it('should logout', function(done) {
      request(app)
      .get('/logout')
      .expect(302)
      .expect(/Redirecting to login/)
      .end(done);
    });
  });

});

