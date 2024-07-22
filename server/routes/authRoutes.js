const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

router.get('/spotify', (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:4000/auth/spotify/callback';
  const scopes = ['user-read-email', 'user-read-private', 'user-read-playback-state'];
  const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&show_dialog=true`;
  res.redirect(url);
});

router.get('/spotify/callback', async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = 'http://localhost:4000/auth/spotify/callback';

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const tokenData = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await axios.post(tokenUrl, tokenData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, refresh_token, expires_in } = response.data;

    const userProfileUrl = 'https://api.spotify.com/v1/me';
    const userProfileResponse = await axios.get(userProfileUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userProfileResponse.data;

    let dbUser = await User.findOne({ spotifyId: user.id });
    if (!dbUser) {
      dbUser = new User({
        spotifyId: user.id,
        displayName: user.display_name,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date().getTime() + expires_in * 1000,
      });
      await dbUser.save();
    } else {
      dbUser.accessToken = access_token;
      dbUser.refreshToken = refresh_token;
      dbUser.expiresAt = new Date().getTime() + expires_in * 1000;
      await dbUser.save();
    }

    const token = jwt.sign({ spotifyId: user.id }, process.env.SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:5173/main?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error authenticating with Spotify');
  }
});

module.exports = router;
