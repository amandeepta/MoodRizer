const Room = require('../models/Room');
const User = require('../models/User');
const axios = require('axios');

async function getUserInfo(accessToken) {
  return await User.findOne({ accessToken }) || null;
}

async function getSongUri(songName, accessToken) {
  const searchUrl = 'https://api.spotify.com/v1/search';

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        q: songName,
        type: 'track',
        limit: 1
      }
    });

    const tracks = response.data.tracks.items;
    return tracks.length > 0 ? tracks[0].uri : null;
  } catch (error) {
    console.error('Error searching for song:', error);
    return null;
  }
}

async function getUsersInRoom(roomId) {
  try {
    const room = await Room.findOne({ roomId });
    return room ? room.users.map(user => user.name) : [];
  } catch (error) {
    console.error('Error fetching users in room:', error);
    return [];
  }
}

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    let accessToken;
    let currentRoomId;
    let userName;
    let songinfo;

    socket.on('joinRoom', async (token, roomId, callback) => {
      accessToken = token;
      currentRoomId = roomId;

      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        const userInfo = await getUserInfo(accessToken);
        if (!userInfo) {
          return callback({ success: false, message: 'User not found' });
        }

        userName = userInfo.displayName;

        const room = await Room.findOne({ roomId });
        if (room) {
          const userInRoom = room.users.find(user => user.accessToken === accessToken);
          if (!userInRoom) {
            room.users.push({ name: userInfo.displayName, accessToken });
            await room.save();
          }

          socket.join(roomId);
          const usersInRoom = await getUsersInRoom(roomId);
          io.to(roomId).emit('newUserJoined', usersInRoom, userInfo.displayName);

          callback({ success: true, message: 'Joined room successfully' });
        } else {
          callback({ success: false, message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('sendSong', async (songName) => {
      if (!accessToken || !songName) {
        return;
      }

      try {
        const songUri = await getSongUri(songName, accessToken);
        if (!songUri) {
          console.error('Could not find song URI');
          return;
        }
        console.log(songUri);
        const songInfo = {
          name: songName,
          uri: songUri,
          user: userName
        };
        songinfo = songInfo;

        io.to(currentRoomId).emit('receive', songInfo);
      } catch (error) {
        console.error('Error sending song:', error);
      }
    });

    socket.on('music-control', (play) => {
      io.to(currentRoomId).emit('play-song', play);
    });

    socket.on('disconnect', async () => {
      if (accessToken && currentRoomId) {
        try {
          const room = await Room.findOne({ roomId: currentRoomId });
          if (room) {
            room.users = room.users.filter(user => user.accessToken !== accessToken);
            await room.save();

            const usersInRoom = room.users.map(user => user.name);
            const userInfo = await getUserInfo(accessToken);
            socket.broadcast.to(currentRoomId).emit('userLeft', usersInRoom, userInfo.displayName);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });
};

module.exports = socketHandler;
