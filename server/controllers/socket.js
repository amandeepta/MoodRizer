const Room = require('../models/Room');
const axios = require('axios');
const User = require('../models/User');

// Function to generate a random room ID
function generateRoomId() {
  const val = Math.floor(10000 + Math.random() * 90000).toString();
  console.log('Generated Room ID:', val);
  return val;
}


// Socket.IO event handler
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', async (accessToken, callback) => {
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        let roomId;
        let roomExists;
        do {
          roomId = generateRoomId();
          console.log('Attempting to create room with ID:', roomId);
          roomExists = await Room.exists({ roomId });
        } while (roomExists);

        const room = new Room({ roomId, users: [accessToken] });
        await room.save();

        // Get the creator's info and notify the client
        const creatorInfo = await User.findOne({ accessToken });
        if (creatorInfo) {
          socket.join(roomId);
          socket.emit('creator', {
            name: creatorInfo.displayName || 'Unknown',
          });
        }

        callback({ success: true, roomId });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, message: 'Failed to create room' });
      }
    });

    socket.on('joinRoom', async (accessToken, roomId, callback) => {
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        const room = await Room.findOne({ roomId });
        if (room) {
          let newUserInfo;
          if (!room.users.includes(accessToken)) {
            room.users.push(accessToken);
            await room.save();
            newUserInfo = await User.findOne({accessToken});
          }

          socket.join(roomId);

          // Notify other users about the new user
          if (newUserInfo) {
            socket.broadcast.to(roomId).emit('newUserJoined', newUserInfo.displayName);
          }

          callback({ success: true });
        } else {
          callback({ success: false, message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    // Close the connection event
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandler;
