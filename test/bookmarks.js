var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');
var Q = require('q');

var User = require('../models/User').User;
var Bookmark = require('../models/Bookmark').Bookmark;

var Cookies;



describe('bookmark test', function() {
  before(function(done) {

    Q.nmcall(User, 'remove', {id: 'hoge' })
    .then(function() {
      return Q.nmcall(User, 'create', { id: 'testuser' });
    })
    .then(function(user) {
      var req = request(app).post('/login');
      req.send({ id: user.id });
      return Q.nmcall(req, 'end');
    })
    .then(function(res) {
      var deferred = Q.defer();
      Cookies = res.headers['set-cookie'].map(function(r){
        return r.replace("; path=/; httponly","")
      }).join("; ");
      deferred.resolve(res);
      return deferred.promise;
    })
    .then(function() {
      return Q.nmcall(Bookmark, 'remove', {});
    })
    .then(function() {
      return Q.nmcall(Bookmark, 'create', { 
        url: 'http://localhost/test',
        user: 'testuser'
      });
    })
    .then(function(obj) {
      done();
    })
    .catch(function(error) {
      console.log('#error:' + error);
      done();
    })
    .done();
  });

  describe('GET /bookmarks', function() {
    it('should retun an array', function(done) {
      var req = request(app).get('/bookmarks');
      req.cookies = Cookies;
      req.expect(200)
      .expect(/http:\/\/localhost\/test/)
      .end(done);
    });
  });

  describe('POST /bookmarks', function() {
    it('should add a bookmark', function(done) {
      var req = request(app).post('/bookmarks');
      req.cookies = Cookies;
      req.send({ url: 'http://test/', name: 'hoge' })
      .expect(302)
      .expect(/Redirecting to \/bookmarks/)
      .end(done); 
    });
  });

});

