const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    require: true,
    unique: true
  },
  status: {
    type: Number,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  realname: {
    type: String
  },
  role: {
    type: Number,
    require: true
  }
});


module.exports = mongoose.model('User',UserSchema);
