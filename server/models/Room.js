const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  users: {
    type: [userSchema], // Array of user objects
    default: []
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
