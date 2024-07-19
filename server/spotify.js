const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/user');

const app = express();

app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: false,
}));
 
passport.use(
  new SpotifyStrategy({
    clientID: YOUR_CLIENT_ID,
    clientSecret: YOUR_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/auth/spotify/callback'
  },
  async (accessToken, refreshToken, expires_in, profile, done) => {
    let user = await User.findOne({ spotifyId: profile.id });

    if (!user) {
      user = new User({
        spotifyId: profile.id,
        displayName: profile.displayName,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: new Date().getTime() + (expires_in * 1000) 
      });
      await user.save();
    } else {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.expiresAt = new Date().getTime() + (expires_in * 1000);
      await user.save();
    }

    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.spotifyId);
});

passport.deserializeUser(async (spotifyId, done) => {
  try {
    const user = await User.findOne({ spotifyId });
    done(null, user);
  } catch (err) {
    done(err);
  }
});