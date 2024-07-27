
const Room = require('../models/Room');

const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
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

async function playSongOnDevice(accessToken, deviceId, trackUri) {
  spotifyApi.setAccessToken(accessToken);
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

async function searchSongByName(accessToken, songName) {
  spotifyApi.setAccessToken(accessToken);
  try {
    const response = await spotifyApi.searchTracks(`track:${songName}`);
    const track = response.body.tracks.items[0];
    if (!track) {
      throw new Error('Song not found');
    }
    return track.uri;
  } catch (error) {
    console.error('Error searching for song:', error);
    throw error;
  }
}

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    console.log('New client connected');

    socket.on('createRoom', async (accessToken, callback) => {
        if (!accessToken) {
          res.redirect('./spotify/callback');
        }
        try {
        let roomId;
        do {
          roomId = generateRoomId();
          const roomExists = await Room.exists({ roomId });
          if (!roomExists) break;
        } while (true);
        
        const room = new Room({ roomId, users: [user.accessToken] });
        await room.save();

        const userInfoResponse = await axios.get(`http://localhost:4000/fetch-info?accessToken=${accessToken}`);
        const { displayName, profileImage, favoriteGenre, leastFavoriteGenre, favoriteArtist } = userInfoResponse.data;

      io.to(socket.id).emit('userInfo', {
        userInfo: {
          displayName,
          profileImage,
          favoriteGenre,
          leastFavoriteGenre,
          favoriteArtist
        },

    });

        callback({ success: true, roomId });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, message: 'Failed to create room' });
      }
    });

    socket.on('joinRoom', async (accessToken, roomId, callback) => {
      if (!accessToken) {
        res.redirect('./spotify/callback');
      }

      try {

        const room = await Room.findOne({ roomId });
        if (room) {
          room.users.push(user.accessToken);
          await room.save();
          socket.join(roomId);

          const userInfoResponse = await axios.get(`http://localhost:4000/fetch-info?accessToken=${accessToken}`);
        const { displayName, profileImage, favoriteGenre, leastFavoriteGenre, favoriteArtist } = userInfoResponse.data;

      io.to(socket.id).emit('userInfo', {
        userInfo: {
          displayName,
          profileImage,
          favoriteGenre,
          leastFavoriteGenre,
          favoriteArtist
        },
    });

          callback({ success: true });
        } else {
          callback({ success: false, message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('playSong', async (roomId, songName) => {
      try {
        const room = await Room.findOne({ roomId }).populate('users');
        if (!room) {
          throw new Error('Room not found');
        }

        for (const user of room.users) {
          const device = await getActiveDevices(user.accessToken);
          const trackUri = await searchSongByName(user.accessToken, songName);
          await playSongOnDevice(user.accessToken, device, trackUri);
        }

        io.in(roomId).emit('playSongSuccess', songName);
      } catch (error) {
        console.error('Error playing song:', error);
        io.in(roomId).emit('playSongError', { error: 'Failed to play song' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
    });
  });
};

module.exports = socketHandler;

