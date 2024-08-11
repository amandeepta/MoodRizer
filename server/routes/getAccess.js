const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

function generateRoomId() {
  const val = Math.floor(10000 + Math.random() * 90000).toString();
  return val;
}

router.get('/create-room', async (req, res) => {
  try {
    let roomId;
    let roomExists;
    do {
      roomId = generateRoomId();
      roomExists = await Room.exists({ roomId });
    } while (roomExists);
    const newRoom = new Room({ roomId: roomId, users: [] });
    await newRoom.save(); 
    res.status(200).json({
      success: true,
      roomId: roomId
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
});

router.get('/check', async (req, res) => {
  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    const room = await Room.findOne({ roomId });

    if (room) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error checking room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/token', (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const accessToken = req.user.accessToken;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Access token not found' });
    }

    res.json({ success: true, accessToken });
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
