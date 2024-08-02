const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const router = express.Router();

router.use(cookieParser());

router.get('/auth/spotify', async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:4000/auth/spotify/callback');
  const scopes = ['user-read-email', 'user-read-private', 'user-read-playback-state'];

  const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&show_dialog=true`;

  res.redirect(url);
});

router.get('/auth/spotify/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = 'http://localhost:4000/auth/spotify/callback';

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const tokenData = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams(tokenData).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = response.data;

    const userProfileUrl = 'https://api.spotify.com/v1/me';
    const userProfileResponse = await axios.get(userProfileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = userProfileResponse.data;

    let dbUser = await User.findOne({ spotifyId: user.id });
    if (!dbUser) {
      dbUser = new User({
        spotifyId: user.id,
        displayName: user.display_name,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: Date.now() + (expiresIn * 1000),
      });
      await dbUser.save();
    } else {
      dbUser.accessToken = accessToken;
      dbUser.refreshToken = refreshToken;
      dbUser.expiresAt = Date.now() + (expiresIn * 1000);
      await dbUser.save();
    }

    const token = jwt.sign({ accessToken: accessToken }, process.env.SECRET, { expiresIn: '1h' });

    res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 });

    res.redirect('http://localhost:5173/main');
  } catch (error) {
    console.error('Error during Spotify authentication:', error);
    res.status(500).send('Error authenticating with Spotify');
  }
});

module.exports = router;
