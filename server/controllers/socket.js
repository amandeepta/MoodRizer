const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi();

function generateRoomId() {
  return Math.floor(10000 + Math.random() * 90000).toString(); 
}

async function getActiveDevices(accessToken) {
  spotifyApi.setAccessToken(accessToken);
  try {
    const response = await spotifyApi.getMyCurrentPlaybackState();
    return response.body.device;
  } catch (error) {
    console.error('Error retrieving devices:', error);
    throw error;
  }
}

async function playSongOnDevice(accessToken, deviceId, songUrl) {
  spotifyApi.setAccessToken(accessToken);
  const trackId = extractTrackIdFromUrl(songUrl);
  if (!trackId) {
    throw new Error('Invalid song URL');
  }
  const trackUri = `spotify:track:${trackId}`;
  try {
    await spotifyApi.play({
      uris: [trackUri]
    }, {
      device_id: deviceId
    });
  } catch (error) {
    console.error('Error playing song on device:', error);
    throw error;
  }
}

function extractTrackIdFromUrl(url) {
  const match = url.match(/track\/([^/?#&]*)/);
  return match ? match[1] : null;
}

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    console.log('New client connected');

    socket.on('createRoom', async (accessToken, callback) => {
      if (!accessToken) {
        return callback({ error: 'No access token provided' });
      }
      
      try {
        const user = await User.findOne({ accessToken });
        if (!user) {
          return callback({ success: false, message: 'User not authenticated' });
        }
        
        let roomId;
        do {
          roomId = generateRoomId();
          const roomExists = await Room.exists({ roomId });
          if (!roomExists) break;
        } while (true);
        
        const room = new Room({ roomId, users: [user.accessToken] });
        await room.save();
        callback({ success: true, roomId });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, message: 'Failed to create room' });
      }
    });

    socket.on('joinRoom', async (roomId, accessToken, callback) => {
      if (!roomId || !accessToken) {
        return callback({ error: 'Room ID or access token not provided' });
      }

      try {
        const user = await User.findOne({ accessToken });
        if (!user) {
          return callback({ success: false, message: 'User not authenticated' });
        }

        const room = await Room.findOne({ roomId });
        if (room) {
          room.users.push(user.accessToken);
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

    socket.on('playSong', async (roomId, songUrl) => {
      try {
        const room = await Room.findOne({ roomId }).populate('users');
        if (!room) {
          throw new Error('Room not found');
        }

        for (const user of room.users) {
          const device = await getActiveDevices(user.accessToken);
          await playSongOnDevice(user.accessToken, device, songUrl);
        }

        io.in(roomId).emit('playSongSuccess', songUrl);
      } catch (error) {
        console.error('Error playing song:', error);
        io.in(roomId).emit('playSongError', { error: 'Failed to play song' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandler;
