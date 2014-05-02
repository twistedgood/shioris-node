var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');

describe('user test', function() {
  describe('GET /user', function() {
    it('should retun an array', function(done) {
      request(app)
      .get('/users')
      .expect(200)
      .expect(/respond/)
      .end(done);
    });
  });
});

