const User = require("../models/User");
const socketHandler = require("../controllers/socket");

const successAuth = async (req, res) => {
  try {
    const spotifyId = req.user.spotifyId;
    const roomId = req.query.roomId;
    const user = await User.findOne({ spotifyId });

    if (!user) {
      throw new Error('User not authenticated');
    }

    const accessToken = user.accessToken;

    if (roomId) {
      res.redirect(`/join-room?roomId=${roomId}&accessToken=${accessToken}`);
    } else {
      res.redirect(`/create-room?accessToken=${accessToken}`);
    }
  } catch (error) {
    console.error('Error in authentication success handler:', error);
    res.redirect('/');
  }
};

const createRoom = async (req, res) => {
  const accessToken = req.query.accessToken;

  if (!accessToken) {
    return res.status(400).json({ error: 'No access token provided' });
  }

  try {
    const io = req.app.get('io'); // Retrieve the socket.io instance
    socketHandler.createRoom(io, accessToken, (response) => {
      res.status(response.success ? 200 : 400).json(response);
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

const joinRoom = async (req, res) => {
  const { roomId, accessToken } = req.query;

  if (!roomId || !accessToken) {
    return res.status(400).json({ error: 'Room ID or access token not provided' });
  }

  try {
    const io = req.app.get('io'); // Retrieve the socket.io instance
    socketHandler.joinRoom(io, roomId, accessToken, (response) => {
      res.status(response.success ? 200 : 400).json(response);
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

const playSong = async (req, res) => {
  const { roomId, songUrl } = req.body;

  if (!roomId || !songUrl) {
    return res.status(400).json({ error: 'Room ID or song URL not provided' });
  }

  try {
    const io = req.app.get('io'); // Retrieve the socket.io instance
    socketHandler.playSong(io, roomId, songUrl);
    res.status(200).json({ message: 'Song playback initiated' });
  } catch (error) {
    console.error('Error initiating song playback:', error);
    res.status(500).json({ error: 'Failed to initiate song playback' });
  }
};

module.exports = {
  successAuth,
  createRoom,
  joinRoom,
  playSong
};
