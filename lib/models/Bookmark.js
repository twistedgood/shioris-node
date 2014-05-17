var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = require('models/User').UserSchema;

var BookmarkSchema = new Schema({
    url: { type: String }
  , title: { type: String }
  , content: { type: String }
  , user: { type: String }
  , created_at: { type: Date, default: Date.now }
});

var Bookmark = mongoose.model('Bookmark', BookmarkSchema);

exports.Bookmark = Bookmark;
