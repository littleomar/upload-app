
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FileSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  filename: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  realname: {
    type: String,
    require: true
  },
  time: {
    type: String,
    require: true
  }
});


module.exports = mongoose.model('File',FileSchema)
