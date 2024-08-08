const Room = require('../models/Room');
const User = require('../models/User');

// Function to generate a random room ID
function generateRoomId() {
  const val = Math.floor(10000 + Math.random() * 90000).toString();
  console.log('Generated Room ID:', val);
  return val;
}

// Helper function to get user info based on access token
async function getUserInfo(accessToken) {
  const user = await User.findOne({ accessToken });
  return user ? { name: user.displayName, imageUrl: user.imageUrl } : null;
}

// Socket.IO event handler
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Store the socket's access token
    let accessToken;

    // Handle 'createRoom' event
    socket.on('createRoom', async (token, callback) => {
      accessToken = token;
      if (!accessToken) {
        return callback({ success: false, message: 'Access token is required. Redirecting to Spotify callback.' });
      }

      try {
        let roomId;
        let roomExists;
        do {
          roomId = generateRoomId();
          roomExists = await Room.exists({ roomId });
        } while (roomExists);

        const room = new Room({ roomId, users: [accessToken] });
        await room.save();

        const creatorInfo = await getUserInfo(accessToken);
        socket.join(roomId);
        socket.emit('creator', creatorInfo);

        callback({ success: true, roomId });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, message: 'Failed to create room' });
      }
    });

    // Handle 'joinRoom' event
    socket.on('joinRoom', async (token, roomId, callback) => {
      accessToken = token;
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
            newUserInfo = await getUserInfo(accessToken);
          }

          socket.join(roomId);

          // Notify other users about the new user
          if (newUserInfo) {
            socket.broadcast.to(roomId).emit('newUserJoined', newUserInfo);
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

    // Handle 'disconnect' event
    socket.on('disconnect', async () => {
      console.log('Client disconnected');
      socket.disconnect();
      // Remove the user from the room when they disconnect
      if (accessToken) {
        const room = await Room.findOne({ users: accessToken });
        if (room) {
          room.users.pull(accessToken);
          await room.save();
          socket.broadcast.to(room.roomId).emit('userLeft', await getUserInfo(accessToken));
        }
      }
    });
  });
};

module.exports = socketHandler;