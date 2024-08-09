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
  return user ? { name: user.displayName} : null;
}

// Helper function to get all users in a room
async function getAllUsersInRoom(room) {
  const userIds = room.users; // Assuming 'users' field contains access tokens
  const usersPromises = userIds.map(getUserInfo);
  const users = await Promise.all(usersPromises);
  return users.filter(user => user !== null); // Filter out any failed lookups
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
        socket.emit('roomUsers', [creatorInfo]); // Emit initial room users to the creator

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

          // Send current room users to the newly joined user
          const roomUsers = await getAllUsersInRoom(room);
          socket.emit('roomUsers', roomUsers);

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
          console.log("User left");
          socket.broadcast.to(room.roomId).emit('userLeft', await getUserInfo(accessToken));
        }
      }
    });
  });
};

module.exports = socketHandler;
