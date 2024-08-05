const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config();

const router = express.Router();

router.use(cookieParser());
router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
  // Store the user's Spotify ID in the session
  done(null, user.spotifyId);
});

passport.deserializeUser(async (spotifyId, done) => {
  try {
    // Fetch the user from the database using the Spotify ID
    const user = await User.findOne({ spotifyId });
    if (!user) {
      return done(new Error('User not found')); // Handle case where user is not found
    }
    done(null, user); // Pass the user object to req.user
  } catch (err) {
    done(err); // Pass any error that occurred during retrieval
  }
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/spotify/callback',
      scope: ['user-read-email', 'user-read-private', 'user-read-playback-state']
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      const user = await User.findOne({ spotifyId: profile.id });
      if (!user) {
        user = new User({
          spotifyId: profile.id,
          displayName: profile.displayName,
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAt: Date.now() + (expires_in * 1000)
        });
        await user.save();
      } else {
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.expiresAt = Date.now() + (expires_in * 1000);
        await user.save();
      }
      return done(null, user);
    }
  )
);

router.get('/spotify', passport.authenticate('spotify'));

router.get('/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:5173/main');
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.redirect('http://localhost:5173'); 
    });
  });
});

module.exports = router;