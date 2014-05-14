var request = require('supertest'),
  assert = require('assert'),
  app = require('../app');

var Q = require('q');
var User = require('../models/User').User;
var Bookmark = require('../models/Bookmark').Bookmark;

var Cookies;


describe('bookmark test', function() {

  before(function(done) {
    Q(User.remove({}).exec())
    .then(function() {
      return Q(User.create({
        id: 'user@test',
        password: 'pswd@test'
      }));
    })
    .then(function(user) {
      var req = request(app).post('/login');
      req.send({ id: user.id, password: user.password });
      return Q.nmcall(req, 'end');
    })
    .then(function(res) {
      /*
      Object.keys(res.headers).forEach(function(key) {
        var val = res.headers[key];
        console.log('#' + key + ':' + val);
      });
      */
      Cookies = res.headers['set-cookie'].map(function(r){
        return r.replace("; path=/; httponly","")
      }).join("; ");
      return true;
    })
    .then(function() {
      return Q(Bookmark.remove({}).exec())
    })
    .then(function() {
      return Q(Bookmark.create([
        { 
          url: 'http://localhost/test1',
          title: 'test-title1',
          content: 'test-content1',
          user: 'user@test'
        },
        { 
          url: 'http://localhost/test2',
          title: 'test-title2',
          content: 'test-content2',
          user: 'user@test'
        },
        { 
          url: 'http://localhost/test0',
          title: 'test-title0',
          content: 'test-content0',
          user: 'user0'
        }
      ]));
    })
    .then(function() {
      done();
    })
    .catch(function(error) {
      console.log('#error:' + error);
    });
  });

  describe('GET /bookmarks', function() {
    it('should show bookmarks', function(done) {
      var req = request(app).get('/bookmarks');
      req.cookies = Cookies;
      req.expect(200)
      .expect(/test-title1/)
      .expect(/test-title2/)
      .end(done);
    });

    it('should show bookmarks', function(done) {
      var req = request(app).get('/bookmarks');
      req.cookies = Cookies;
      req.send({ u: 'user0' })
      req.expect(200)
      .expect(/test-title0/)
      .end(done);
    });
 
    it('should show bookmarks', function(done) {
      var req = request(app).get('/bookmarks');
      req.cookies = Cookies;
      req.send({ q: 'tent1' })
      req.expect(200)
      .expect(/test-title1/)
      .end(done);
    });
 });

  describe('POST /bookmarks', function() {
    it('should add a bookmark', function(done) {
      var req = request(app).post('/bookmarks');
      req.cookies = Cookies;
      req.send({ url: 'http://www.example.com/', title: 'Example' })
      .expect(302)
      .expect(/Redirecting to bookmarks/)
      .end(done); 
    });

    it('should error', function(done) {
      var req = request(app).post('/bookmarks');
      req.cookies = Cookies;
      req.send({})
      .expect(200)
      .expect(/URL is required/)
      .end(done); 
    });
  });

  describe('POST /bookmarks', function() {
    it('should error', function(done) {
      var req = request(app).post('/bookmarks');
      req.cookies = Cookies;
      req.send({ url: 'http://www.example.com/', title: 'Example' })
      .expect(200)
      .expect(/Error: Already Registered/)
      .end(done); 
    });
  });

});

