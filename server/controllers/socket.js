const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Function to generate a random room ID
function generateRoomId() {
  return Math.floor(10000 + Math.random() * 90000).toString(); 
}

// Function to fetch user information from Spotify
async function fetchUserInfo(accessToken) {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user information:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch user information');
  }
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
