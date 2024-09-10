const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

router.post('/check', async (req, res) => {
  try {
    const { roomId } = req.body; // Extract roomId directly from req.body
    console.log(roomId);
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required' });
    }

    const room = await Room.findOne({ roomId: roomId.toString() }); // Ensure roomId is a string for the query

    if (room) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Room not found" });
    }
  } catch (error) {
    console.error('Error checking room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    res.status(200).json({ success: true, decoded });
  } catch (error) {
    console.log("Error occurred", error);
    res.status(500).json({ success: false, message: "Failed to decode token" });
  }
});


module.exports = router;
