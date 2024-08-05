const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Function to generate a random room ID
function generateRoomId() {
  const val =  Math.floor(10000 + Math.random() * 90000).toString(); 
  console.log(val);
  return val;

}

// Socket.IO event handler
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', async ( accessToken, callback) => {
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        let roomId;
        do {
          roomId = generateRoomId();
          console.log('Attempting to create room with ID:', roomId);
          const roomExists = await Room.exists({ roomId });
          if (!roomExists) break;
        } while (true);

        const room = new Room({ roomId, users: [accessToken] });
        await room.save();

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
          room.users.push(accessToken);
          await room.save();
          socket.join(roomId);

          callback({ success: true });
        } else {
          callback({ success: false, message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('populate', async ( callback) => {
      const accessToken = req.cookies.authToken;
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        const decoded = jwt.decode(accessToken, { complete: true });
        if (!decoded) {
          return callback({ success: false, message: 'Invalid access token. Redirecting to Spotify callback.' });
        }

        const user = await fetchUserInfo(accessToken);
        callback({ success: true, user });
      } catch (error) {
        console.error('Error while populating the user info:', error.message);
        callback({ success: false, message: 'Failed to populate user info' });
      }
    });
  });
};

module.exports = socketHandler;
