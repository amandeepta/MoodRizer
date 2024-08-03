const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser);
router.get('/token', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token found in cookies' });
  }

  try {
    const decoded = jwt.decode(token);
    res.json({ success: true, decoded });
  } catch (error) {
    console.error('Error decoding token:', error);
    res.status(500).json({ success: false, message: 'Failed to decode access token' });
  }
});

module.exports = router;