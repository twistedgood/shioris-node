var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id: { type: String }
  , name: { type: String }
  , created_at: { type: Date, default: Date.now }
});

var User = mongoose.model('User', UserSchema);

exports.User = User;
