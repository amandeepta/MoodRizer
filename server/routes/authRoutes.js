const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

passport.serializeUser((user, done) => {
  done(null, user.spotifyId);
});

passport.deserializeUser(async (spotifyId, done) => {
  try {
    const user = await User.findOne({ spotifyId });
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/spotify/callback',
      scope: [
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state',
        'streaming',
        'user-read-currently-playing',
      ],
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      try {
        let user = await User.findOne({ spotifyId: profile.id });
        const expirationTime = Date.now() + expires_in * 1000;

        if (!user) {
          user = new User({
            spotifyId: profile.id,
            displayName: profile.displayName,
            accessToken,
            refreshToken,
            expiresAt: expirationTime,
          });
        } else {
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          user.expiresAt = expirationTime;
        }

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

router.get('/spotify', passport.authenticate('spotify', {
  scope: [
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming',
    'user-read-currently-playing',
  ],
  showDialog: true,
}));

router.get('/spotify/callback', passport.authenticate('spotify', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('http://localhost:5173/main');
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

module.exports = router;