const express = require('express');
const router = express.Router();

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
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
