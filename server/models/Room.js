const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: String,
  users: [String],
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
