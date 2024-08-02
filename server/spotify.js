const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');
const dotenv = require('dotenv');
 // Import cookie-parser

dotenv.config(); // Load environment variables from .env file

const app = express();

// Use cookie-parser middleware
app.use(cookieParser());

app.get('/auth/spotify', async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = 'http://localhost:4000/auth/spotify/callback';
  const scopes = ['user-read-email', 'user-read-private', 'user-read-playback-state'];

  const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&show_dialog=true`;

  res.redirect(url);
});

// Spotify callback route
app.get('/auth/spotify/callback', async (req, res) => {
  const code = req.query.code;
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
    const response = await axios.post(tokenUrl, tokenData);
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in;

    // Get user profile
    const userProfileUrl = 'https://api.spotify.com/v1/me';
    const userProfileResponse = await axios.get(userProfileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = userProfileResponse.data;

    // Check if user exists in database
    let dbUser = await User.findOne({ spotifyId: user.id });
    if (!dbUser) {
      dbUser = new User({
        spotifyId: user.id,
        displayName: user.display_name,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date().getTime() + (expiresIn * 1000),
      });
      await dbUser.save();
    } else {
      dbUser.accessToken = accessToken;
      dbUser.refreshToken = refreshToken;
      dbUser.expiresAt = new Date().getTime() + (expiresIn * 1000);
      await dbUser.save();
    }

    const token = jwt.sign({ accessToken: accessToken }, process.env.SECRET, { expiresIn: '1h' });
    
    res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 }); 

    res.redirect('http://localhost:5173');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error authenticating with Spotify');
  }
});


module.exports = router;
