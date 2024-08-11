const Room = require('../models/Room');
const User = require('../models/User');

async function getUserInfo(accessToken) {
  const user = await User.findOne({ accessToken });
  return user ? user : null;
}

async function getAllUserNamesInRoom(room) {
  return room.users.map(user => user.name);
}

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');
    let accessToken;

    socket.on('joinRoom', async (token, roomId, callback) => {
      accessToken = token;
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        const userInfo = await getUserInfo(accessToken);
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

          const roomUsers = await getAllUserNamesInRoom(room);
          socket.emit('roomUsers', roomUsers);

          socket.broadcast.to(roomId).emit('newUserJoined', userInfo);

          callback({ success: true });
        } else {
          callback({ success: false, message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, message: 'Failed to join room' });
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected');
      if (accessToken) {
        try {
          const room = await Room.findOne({ 'users.accessToken': accessToken });
          if (room) {
            room.users = room.users.filter(user => user.accessToken !== accessToken);
            await room.save();

            socket.broadcast.to(room.roomId).emit('userLeft', await getUserInfo(accessToken));

            const roomUsers = await getAllUserNamesInRoom(room);
            socket.broadcast.to(room.roomId).emit('roomUsers', roomUsers);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });
};

module.exports = socketHandler;
