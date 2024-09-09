const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const generateToken = (token) => {
  return jwt.sign(
    { token },
    process.env.SECRET,
    { expiresIn: '1h' }
  );
};

const router = express.Router();

router.get('/spotify', (req, res) => {
  const scope = [
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming',
    'user-read-currently-playing',
  ];

  const authURL = `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent('https://mood-rizer-backend.onrender.com/auth/spotify/callback')}&scope=${encodeURIComponent(scope.join(' '))}`;

  res.redirect(authURL + '&show_dialog=true');
});

router.get('/spotify/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://mood-rizer-backend.onrender.com/auth/spotify/callback'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const profile = profileResponse.data;
    const expirationTime = Date.now() + expires_in * 1000;

    let user = await User.findOne({ spotifyId: profile.id });

    if (!user) {
      user = new User({
        spotifyId: profile.id,
        displayName: profile.display_name,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expirationTime,
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.expiresAt = expirationTime;
    }

    await user.save();

    const token = generateToken(user.accessToken);
    res.redirect(`https://mood-rizer.vercel.app/main?token=${token}`);
  } catch (err) {
    res.redirect('/error');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

module.exports = router;
