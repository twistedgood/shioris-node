var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');

var User = require('models/User').User;

var Cookies;

describe('user test', function() {
  before(function(done) {
    User.remove({}, function() {
      User.create({
        id: 'testuser',
        password: 'testpswd'
      }, function() {
        request(app)
        .post('/login')
        .send({ id: 'testuser', password: 'testpswd' })
        .expect(200)
        .end(function(err, res) {
          Cookies = res.headers['set-cookie'].map(function(r){
            return r.replace("; path=/; httponly","")
          }).join("; ");
          done();
        }); 
      });
    }); 
  });

  describe('GET /users', function() {
    it('should retun an array', function(done) {
      var req = request(app).get('/users');
      req.cookies = Cookies;
      req.expect(200)
      .expect(/Add User/)
      .expect(/User Listing/)
      .end(done);
    });
  });

  describe('POST /users', function() {
    it('should add a user', function(done) {
      var req = request(app).post('/users');
      req.cookies = Cookies;
      req.send({ id: 'hoge', password: 'hogehoge' })
      .expect(302)
      .expect(/Redirecting to users/)
      .end(done); 
    });
  });

});

