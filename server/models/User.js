const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: false
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
