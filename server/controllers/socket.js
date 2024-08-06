const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Function to generate a random room ID
function generateRoomId() {
  const val = Math.floor(10000 + Math.random() * 90000).toString();
  console.log(val);
  return val;
}

const getInfo = async (accessToken) => {
  try {
    const userInfoResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userInfo = userInfoResponse.data;

    const favoriteArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const favoriteArtists = favoriteArtistsResponse.data;

    return { userInfo, favoriteArtists };
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    throw error;
  }
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

    socket.on('populate', async (accessToken, callback) => {
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify' });
      }
      try {
        const { userInfo, favoriteArtists } = await getInfo(accessToken);
        const userData = {
          name: userInfo.display_name,
          favoriteArtists: favoriteArtists.items.map(artist => artist.name),
          imageUrl: userInfo.images[0]?.url || '',
        };
        callback({ success: true, user: userData });
      } catch (error) {
        console.error('Error while populating the user info:', error.message);
        callback({ success: false, message: 'Failed to populate user info' });
      }
    });

    // Close the connection event
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandler;
