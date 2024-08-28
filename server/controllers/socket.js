const Room = require('../models/Room');
const User = require('../models/User');

async function getUserInfo(accessToken) {
  return await User.findOne({ accessToken }) || null;
}

async function getUsersInRoom(roomId) {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }
    return room.users.map(user => user.name);
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

    socket.on('joinRoom', async (token, roomId, callback) => {
      accessToken = token;
      currentRoomId = roomId;

      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        const userInfo = await getUserInfo(accessToken);
        userName = userInfo.displayName;
        if (!userInfo) {
          return callback({ success: false, message: 'User not found' });
        }

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
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('sendSong', async (songName) => {
      if (!accessToken || !songName) {
        return;
      }

      try {
        const songInfo = {
          name: songName,
          user: userName
        };

        io.to(currentRoomId).emit('receive', songInfo);
      } catch (error) {
        console.error('Error sending song:', error);
      }
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
